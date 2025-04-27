import { Router, Request, Response } from 'express';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { storage } from '../storage';

export const merchantsRouter = Router();

// Set up multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage for uploaded files
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter for uploads
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedFileTypes = ['.jpg', '.jpeg', '.png', '.pdf'];
  const extname = path.extname(file.originalname).toLowerCase();
  
  if (allowedFileTypes.includes(extname)) {
    return cb(null, true);
  }
  
  cb(new Error('Only .jpg, .jpeg, .png, and .pdf files are allowed'));
};

// Initialize multer upload
const upload = multer({
  storage: fileStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter,
});

// Validation schema for merchant application
const merchantSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  ownerName: z.string().min(2, "Owner name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  address: z.string().min(5, "Business address is required"),
  businessType: z.string(),
  accountHolderName: z.string().min(2, "Account holder name is required"),
  accountNumber: z.string().min(5, "Account number is required"),
  ifscCode: z.string().min(4, "IFSC code is required"),
  bankName: z.string().min(2, "Bank name is required"),
  bankBranch: z.string().min(2, "Branch name is required"),
  productCategories: z.string(), // Will be parsed from JSON string
  gstNumber: z.string().optional(),
  drugLicenseNumber: z.string().min(3, "License number is required"),
  termsAgreed: z.string(), // Will be converted to boolean
  description: z.string().optional(),
});

// Define file upload fields
const uploadFields = [
  { name: 'drugLicense', maxCount: 1 },
  { name: 'gstCertificate', maxCount: 1 },
  { name: 'shopEstablishment', maxCount: 1 },
  { name: 'ownershipProof', maxCount: 1 },
];

/**
 * POST /api/merchants
 * Register a new merchant
 */
merchantsRouter.post('/', upload.fields(uploadFields), async (req: Request, res: Response) => {
  try {
    // Get uploaded files
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    // Validate form data
    const validatedData = merchantSchema.parse(req.body);
    
    // Parse JSON string of product categories
    const productCategories = JSON.parse(validatedData.productCategories);
    
    // Process file paths
    const filePaths: Record<string, string> = {};
    if (files) {
      Object.keys(files).forEach(key => {
        if (files[key]?.[0]) {
          filePaths[key] = files[key][0].path;
        }
      });
    }
    
    // Create merchant application record
    const merchantData = {
      ...validatedData,
      productCategories,
      termsAgreed: validatedData.termsAgreed === 'true',
      fileUploads: filePaths,
      createdAt: new Date(),
      status: 'pending', // Status can be 'pending', 'approved', 'rejected'
    };
    
    // Store merchant application in database
    const merchant = await storage.createMerchantApplication(merchantData);
    
    // Send success response
    res.status(201).json({
      success: true,
      message: 'Merchant application submitted successfully',
      merchantId: merchant.id,
    });
  } catch (error) {
    console.error('Error in merchant registration:', error);
    
    // Handle validation errors separately
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }
    
    // General error response
    res.status(500).json({
      success: false,
      message: 'Failed to process merchant application',
    });
  }
});

/**
 * GET /api/merchants
 * Get all merchant applications (admin only)
 */
merchantsRouter.get('/', async (req: Request, res: Response) => {
  try {
    // TODO: Add authentication middleware to ensure only admins can access
    const merchants = await storage.getMerchantApplications();
    res.status(200).json({ merchants });
  } catch (error) {
    console.error('Error fetching merchant applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch merchant applications',
    });
  }
});

/**
 * GET /api/merchants/:id
 * Get a specific merchant application
 */
merchantsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const merchantId = parseInt(req.params.id);
    const merchant = await storage.getMerchantApplicationById(merchantId);
    
    if (!merchant) {
      return res.status(404).json({
        success: false,
        message: 'Merchant application not found',
      });
    }
    
    res.status(200).json({ merchant });
  } catch (error) {
    console.error('Error fetching merchant application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch merchant application',
    });
  }
});

/**
 * PATCH /api/merchants/:id/status
 * Update a merchant application status (admin only)
 */
merchantsRouter.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    // TODO: Add authentication middleware to ensure only admins can access
    const merchantId = parseInt(req.params.id);
    const { status } = req.body;
    
    // Validate status
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value',
      });
    }
    
    const updatedMerchant = await storage.updateMerchantApplicationStatus(merchantId, status);
    
    if (!updatedMerchant) {
      return res.status(404).json({
        success: false,
        message: 'Merchant application not found',
      });
    }
    
    res.status(200).json({
      success: true,
      message: `Merchant application status updated to ${status}`,
      merchant: updatedMerchant,
    });
  } catch (error) {
    console.error('Error updating merchant application status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update merchant application status',
    });
  }
});

export default merchantsRouter;