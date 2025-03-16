import { useState } from "react";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";

export default function FAQSection() {
  const faqs = [
    {
      question: "Is generic medication as effective as brand-name medication?",
      answer: "Yes. The FDA requires generic drugs to have the same active ingredients, strength, dosage form, and route of administration as the brand-name drug. Generic medications must also meet the same quality and manufacturing standards. The main differences are usually the inactive ingredients, appearance, and cost."
    },
    {
      question: "How does MediCompare get its price information?",
      answer: "MediCompare aggregates pricing data from multiple sources, including pharmacy chains, discount programs, manufacturer databases, and public pricing information. We update our database regularly to ensure you have access to the most current pricing available."
    },
    {
      question: "Is the AI assistant providing medical advice?",
      answer: "No. The AI assistant provides information about medications based on publicly available data, but it does not provide personalized medical advice. Always consult with a healthcare professional before making changes to your medication regimen or for any medical decisions."
    },
    {
      question: "Can I use MediCompare for all types of medications?",
      answer: "MediCompare covers most prescription and over-the-counter medications. However, certain specialized or controlled substances may have limited alternatives or price comparison options. Our database is continuously expanding to include more medications."
    },
    {
      question: "How accurate is the pricing information?",
      answer: "We strive to provide the most accurate pricing information possible. However, prices can vary based on location, insurance coverage, and special promotions. We recommend confirming the price with your pharmacy before making a purchase decision."
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-sans mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-slate-700 max-w-3xl mx-auto">
            Got questions? We've got answers.
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border border-slate-200 rounded-lg overflow-hidden">
                <AccordionTrigger className="px-4 py-3 bg-slate-50 hover:bg-slate-100 transition font-medium text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-4 py-3 bg-white border-t border-slate-200">
                  <p className="text-slate-700">{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
