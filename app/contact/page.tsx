'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    inquiry_type: 'general'
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit inquiry');
      }

      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        inquiry_type: 'general'
      });
    } catch (error: any) {
      setSubmitStatus('error');
      setErrorMessage(error.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Top Navigation Bar - Matched to Main Site */}
      <nav className="bg-white border-b border-gray-50 z-50 shadow-sm">
        <div className="w-full px-8 py-3">
          <div className="flex items-center justify-between">
            {/* Logo and Brand - Matched to Main Site */}
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-full border-0 border-black flex items-center justify-center p-1">
                <Image
                  src="/logo.png"
                  alt="Parasync Logo"
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
              <div className="relative">
                <span className="text-3xl font-bold text-gray-900">Parasync</span>
              </div>
            </Link>

            {/* Right Navigation */}
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="px-5 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Left Side - Info */}
            <div className="space-y-8">
              {/* Header */}
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Contact Us
                </h1>
                <p className="text-lg text-gray-600">
                  Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                </p>
              </div>

              {/* Response Time */}
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Response Time</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  We typically respond to all inquiries within 24-48 business hours. For urgent support requests, please select "Technical Support" as your inquiry type.
                </p>
              </div>

              {/* FAQ Section */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Answers</h2>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-base font-bold text-gray-900 mb-1">How quickly will I get a response?</h3>
                    <p className="text-gray-700 text-sm">
                      We typically respond within 24-48 business hours. Support requests are prioritized and usually answered within 24 hours.
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-base font-bold text-gray-900 mb-1">Can I schedule a demo?</h3>
                    <p className="text-gray-700 text-sm">
                      Yes! For partnership or enterprise inquiries, mention in your message that you'd like to schedule a demo.
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-base font-bold text-gray-900 mb-1">How can I report a security issue?</h3>
                    <p className="text-gray-700 text-sm">
                      For security concerns, please email <a href="mailto:team@parasync.in" className="text-blue-600 hover:underline">team@parasync.in</a> directly.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Contact Form */}
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Send us a Message</h2>

              {/* Success Message */}
              {submitStatus === 'success' && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="text-green-800 font-semibold text-sm">Message Sent Successfully!</p>
                    <p className="text-green-700 text-xs mt-1">We'll get back to you soon.</p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {submitStatus === 'error' && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="text-red-800 font-semibold text-sm">Error Sending Message</p>
                    <p className="text-red-700 text-xs mt-1">{errorMessage}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
                    placeholder="John Doe"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
                    placeholder="john@example.com"
                  />
                </div>

                {/* Inquiry Type */}
                <div>
                  <label htmlFor="inquiry_type" className="block text-sm font-semibold text-gray-700 mb-1">
                    Inquiry Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="inquiry_type"
                    name="inquiry_type"
                    value={formData.inquiry_type}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="billing">Billing & Payments</option>
                    <option value="partnership">Partnership Opportunities</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-1">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
                    placeholder="Brief description of your inquiry"
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.subject.length}/200 characters
                  </p>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-1">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                    rows={5}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none disabled:bg-gray-100"
                    placeholder="Tell us more about your inquiry..."
                    maxLength={2000}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.message.length}/2000 characters
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md text-sm"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
                About Us
              </Link>
              <span className="text-gray-300">|</span>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                Pricing & Revenue
              </Link>
              <span className="text-gray-300">|</span>
              <Link href="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors">
                Privacy Policy
              </Link>
              <span className="text-gray-300">|</span>
              <Link href="/terms" className="text-gray-600 hover:text-gray-900 transition-colors">
                Terms of Use
              </Link>
            </div>
            <div className="text-sm text-gray-500">
              © 2026 Parasync - Get Things Done
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}