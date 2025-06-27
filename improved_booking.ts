"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface FormData {
  name: string;
  email: string;
  business: string;
  message: string;
  selected_models?: string[];
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
  general?: string;
}

export default function ImprovedBooking() {
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    business: "",
    message: "",
    selected_models: []
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  // Load selected AI models from localStorage on component mount
  useEffect(() => {
    try {
      const savedModels = localStorage.getItem("selectedAIModels");
      if (savedModels) {
        const models = JSON.parse(savedModels);
        setForm(prev => ({ ...prev, selected_models: models }));
      }
    } catch (error) {
      console.warn("Failed to load selected models from localStorage:", error);
    }
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.name.trim() || form.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters long";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim() || !emailRegex.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!form.message.trim() || form.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setStatus("loading");
    setStatusMessage("Submitting your consultation request...");

    try {
      const response = await fetch("http://localhost:8000/api/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setStatusMessage("Your consultation request has been submitted successfully! We'll contact you within 24 hours.");
        setForm({
          name: "",
          email: "",
          business: "",
          message: "",
          selected_models: form.selected_models // Keep selected models
        });
        
        // Clear selected models from localStorage after successful submission
        localStorage.removeItem("selectedAIModels");
      } else {
        setStatus("error");
        setStatusMessage(data.detail || "Failed to submit your request. Please try again.");
      }
    } catch (error) {
      setStatus("error");
      setStatusMessage("Network error. Please check your connection and try again.");
      console.error("Submission error:", error);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "loading":
        return <Loader2 className="h-5 w-5 animate-spin" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <section id="booking" className="py-24 bg-gradient-to-br from-gray-50 to-emerald-50">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Book Your Free Consultation
            </h2>
            <p className="text-lg text-gray-600">
              Let's discuss how AI can transform your business. Our experts will analyze your needs and recommend the best approach.
            </p>
          </div>

          <Card className="bg-white shadow-xl border-0">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Consultation Request</CardTitle>
              <CardDescription>
                Fill out the form below and we'll get back to you within 24 hours.
              </CardDescription>
            </CardHeader>

            <CardContent>
              {/* Selected AI Models Display */}
              {form.selected_models && form.selected_models.length > 0 && (
                <div className="mb-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <h4 className="font-medium text-emerald-900 mb-2">
                    Selected AI Models ({form.selected_models.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {form.selected_models.map((modelId, index) => (
                      <Badge key={index} variant="secondary" className="bg-emerald-100 text-emerald-700">
                        {modelId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                      errors.name ? "border-red-300 bg-red-50" : "border-gray-300"
                    }`}
                    placeholder="Enter your full name"
                    disabled={status === "loading"}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                      errors.email ? "border-red-300 bg-red-50" : "border-gray-300"
                    }`}
                    placeholder="your.email@company.com"
                    disabled={status === "loading"}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Business Field */}
                <div>
                  <label htmlFor="business" className="block text-sm font-medium text-gray-700 mb-2">
                    Business/Company
                  </label>
                  <input
                    type="text"
                    id="business"
                    name="business"
                    value={form.business}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder="Your company name (optional)"
                    disabled={status === "loading"}
                  />
                </div>

                {/* Message Field */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    How can we help you? *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-vertical ${
                      errors.message ? "border-red-300 bg-red-50" : "border-gray-300"
                    }`}
                    placeholder="Describe your AI needs, challenges, or goals..."
                    disabled={status === "loading"}
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Consultation Request"
                  )}
                </Button>

                {/* Status Message */}
                {statusMessage && (
                  <div className={`flex items-center gap-2 p-4 rounded-lg ${
                    status === "success" 
                      ? "bg-green-50 text-green-800 border border-green-200" 
                      : status === "error"
                      ? "bg-red-50 text-red-800 border border-red-200"
                      : "bg-blue-50 text-blue-800 border border-blue-200"
                  }`}>
                    {getStatusIcon()}
                    <p className="text-sm">{statusMessage}</p>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
