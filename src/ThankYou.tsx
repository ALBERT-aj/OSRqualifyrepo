import { CheckCircle, Mail, Phone, ArrowRight } from 'lucide-react';
import { useEffect } from 'react';

interface ThankYouProps {
  type: 'qualified' | 'unqualified';
}

export default function ThankYou({ type }: ThankYouProps) {
  const isQualified = type === 'qualified';

  useEffect(() => {
    if (isQualified) {
      // Fire Meta Pixel CompleteRegistration event when thank you page loads
      if (
        typeof window !== 'undefined' &&
        window.fbq &&
        !sessionStorage.getItem('meta_complete_registration_fired')
      ) {
        window.fbq('track', 'CompleteRegistration');
        sessionStorage.setItem('meta_complete_registration_fired', 'true');
      }
    } else {
      // Fire Meta Pixel UnqualifiedLeadCaptured event when unqualified thank you page loads
      if (
        typeof window !== 'undefined' &&
        window.fbq &&
        !sessionStorage.getItem('meta_unqualified_lead_captured_fired')
      ) {
        window.fbq('trackCustom', 'UnqualifiedLeadCaptured');
        sessionStorage.setItem('meta_unqualified_lead_captured_fired', 'true');
      }
    }
  }, [isQualified]);

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-12 overflow-hidden">
      <div className="absolute inset-0 w-full h-full">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/planevideo.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90"></div>
      </div>

      <div className="max-w-3xl w-full relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-[#25D366] p-4 rounded-full">
              <CheckCircle className="w-16 h-16 text-white" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {isQualified ? 'Thank You for Booking!' : 'Thank You for Your Interest!'}
          </h1>

          {isQualified ? (
            <>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Your consultation session has been confirmed. We've sent you a confirmation email with all the details.
              </p>

              <div className="bg-gradient-to-br from-[#25D366]/10 to-[#25D366]/5 border-2 border-[#25D366]/30 rounded-xl p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">What Happens Next?</h2>
                <div className="space-y-4 text-left">
                  <div className="flex items-start space-x-3">
                    <div className="bg-[#25D366] rounded-full p-1 mt-1">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-gray-700">
                      <strong>Check your email</strong> for the meeting link and calendar invite
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-[#25D366] rounded-full p-1 mt-1">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-gray-700">
                      <strong>Prepare documents:</strong> Have your child's academic records ready to discuss
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-[#25D366] rounded-full p-1 mt-1">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-gray-700">
                      <strong>Both parent and student</strong> should attend the session together
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-[#25D366] rounded-full p-1 mt-1">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-gray-700">
                      <strong>Write down questions</strong> you'd like to ask during the consultation
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Need to Reschedule?</h3>
                <p className="text-gray-700 mb-4">
                  You can reschedule your appointment using the link in your confirmation email.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>Check your email for details</span>
                  </div>
                  <div className="hidden sm:block text-gray-400">•</div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>Or contact us directly</span>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 text-lg mb-6">
                We're excited to help your child achieve their dream of studying in Australia!
              </p>
            </>
          ) : (
            <>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                We've received your information and will keep you updated with helpful resources and information for preparing your journey to Australia.
              </p>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">What to Expect</h2>
                <div className="space-y-3 text-left">
                  <div className="flex items-start space-x-3">
                    <ArrowRight className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700">
                      <strong>Regular Updates:</strong> We'll send you valuable information about studying in Australia
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <ArrowRight className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700">
                      <strong>Preparation Tips:</strong> Get insights on academic requirements and visa processes
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <ArrowRight className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700">
                      <strong>Future Opportunities:</strong> When the time is right, we'll be here to help
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 mb-6">
                We're committed to helping African families achieve their education dreams in Australia.
              </p>
            </>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200 space-y-4">
            <img src="/image.png" alt="Optimal Student Recruitment" className="h-20 mx-auto opacity-60 max-w-full object-contain" />
            <a
              href="https://optimalstudentrecruitment.com.au/international-students/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#25D366] hover:text-[#20BD5A] font-semibold text-sm transition-colors block"
            >
              Visit our website
            </a>
            <div className="text-gray-600 text-sm">
              Contact us via email:{' '}
              <a
                href="mailto:student.service@optimalstudentrecruitment.au"
                className="text-[#25D366] hover:text-[#20BD5A] font-semibold transition-colors"
              >
                student.service@optimalstudentrecruitment.au
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
