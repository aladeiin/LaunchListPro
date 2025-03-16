import { Star, StarHalf } from "lucide-react";

export default function TestimonialsSection() {
  const testimonials = [
    {
      rating: 5,
      content: "I was paying over $200 for my cholesterol medication. MediCompare showed me a generic alternative that costs just $15 a month. That's life-changing savings!",
      name: "Maria S.",
      title: "Retired Teacher",
      initials: "MS",
      bgColor: "bg-primary"
    },
    {
      rating: 4.5,
      content: "The AI assistant answered all my questions about drug interactions. It's like having a pharmacist available 24/7. Very impressed with the technology.",
      name: "James T.",
      title: "Software Engineer",
      initials: "JT",
      bgColor: "bg-cyan-500"
    },
    {
      rating: 5,
      content: "As someone managing medications for both my parents, this tool is a lifesaver. I've already saved over $500 in just three months by finding better alternatives.",
      name: "Rebecca L.",
      title: "Healthcare Administrator",
      initials: "RL",
      bgColor: "bg-green-500"
    }
  ];

  return (
    <section className="py-16 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-sans mb-4">What Beta Users Say</h2>
          <p className="text-lg text-slate-700 max-w-3xl mx-auto">
            Early users are already seeing the benefits of MediCompare
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(Math.floor(testimonial.rating))].map((_, i) => (
                    <Star key={i} fill="currentColor" />
                  ))}
                  {testimonial.rating % 1 !== 0 && (
                    <StarHalf fill="currentColor" />
                  )}
                </div>
              </div>
              <p className="text-slate-700 mb-4">
                "{testimonial.content}"
              </p>
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full ${testimonial.bgColor} text-white flex items-center justify-center mr-3`}>
                  {testimonial.initials}
                </div>
                <div>
                  <h4 className="font-medium">{testimonial.name}</h4>
                  <p className="text-sm text-slate-500">{testimonial.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
