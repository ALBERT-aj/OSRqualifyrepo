import { CheckCircle, ArrowRight, ArrowDown, DollarSign, X, AlertCircle, ChevronDown, Quote, GraduationCap, Globe, FileText, Phone, Map, Star, Plane, MapPin, Compass, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import AdminDashboard from './AdminDashboard';
import ThankYou from './ThankYou';
import CountryCodeSelect from './CountryCodeSelect';
import { worldwideCountryCodes } from './worldwideCountryCodes';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

type Page = 'qualification' | 'booking' | 'nurture' | 'admin' | 'thankyou-qualified' | 'thankyou-unqualified';

function App() {
  const calendlyLink = 'https://calendly.com/r-geddes-optimalstudentrecruitment/student-counselling-session?hide_event_type_details=1&hide_gdpr_banner=1&primary_color=6eff00';
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    if (window.location.pathname === '/admin') {
      return 'admin';
    }
    if (window.location.hash === '#thankyou-qualified') {
      return 'thankyou-qualified';
    }
    if (window.location.hash === '#thankyou-unqualified') {
      return 'thankyou-unqualified';
    }
    return 'qualification';
  });

  useEffect(() => {
    if (currentPage === 'booking') {
      const loadCalendly = () => {
        if (window.Calendly) {
          const widget = document.querySelector('.calendly-inline-widget');
          if (widget) {
            window.Calendly.initInlineWidget({
              url: calendlyLink,
              parentElement: widget,
            });
          }
        } else {
          setTimeout(loadCalendly, 100);
        }
      };
      loadCalendly();
    }
  }, [currentPage, calendlyLink]);

  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    proofOfFunds: null as boolean | null,
    applicationCosts: null as boolean | null,
    serviceFee: null as boolean | null
  });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    phoneCountryCode: '+234',
    isWhatsappConnected: '',
    countryOfResidence: '',
    textMessagePhone: '',
    textMessageCountryCode: '+234'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [questionsVisible, setQuestionsVisible] = useState(false);


  const handleAnswer = (questionKey: keyof typeof answers, value: boolean) => {
    setAnswers(prev => ({ ...prev, [questionKey]: value }));
  };

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      const allYes = answers.proofOfFunds && answers.applicationCosts && answers.serviceFee;
      if (allYes) {
        setCurrentPage('booking');
      } else {
        setCurrentPage('nurture');
      }
    }
  };

  const canProceed = () => {
    if (step === 1) return answers.proofOfFunds !== null;
    if (step === 2) return answers.applicationCosts !== null;
    if (step === 3) return answers.serviceFee !== null;
    return false;
  };

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const { data: existingLead } = await supabase
        .from('leads')
        .select('id')
        .eq('email', formData.email)
        .maybeSingle();

      const notes = existingLead ? 'Duplicate submission - user submitted form again' : null;

      const { error } = await supabase.from('leads').insert({
        first_name: formData.firstName,
        last_name: formData.lastName,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone_number: formData.phoneNumber,
        phone_country_code: formData.phoneCountryCode,
        is_whatsapp_connected: formData.isWhatsappConnected === 'yes',
        country_of_residence: formData.countryOfResidence,
        text_message_phone: formData.textMessagePhone,
        text_message_country_code: formData.textMessageCountryCode,
        whatsapp: formData.isWhatsappConnected === 'yes' ? `${formData.phoneCountryCode}${formData.phoneNumber}` : null,
        proof_of_funds: answers.proofOfFunds || false,
        application_costs: answers.applicationCosts || false,
        service_fee: answers.serviceFee || false,
        is_qualified: false,
        source_page: 'nurture',
        notes: notes
      });

      if (error) throw error;

      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        phoneCountryCode: '+234',
        isWhatsappConnected: '',
        countryOfResidence: '',
        textMessagePhone: '',
        textMessageCountryCode: '+234'
      });
      setCurrentPage('thankyou-unqualified');

    } catch (error: any) {
      setSubmitError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleRevealQuestions = () => {
    setQuestionsVisible(true);
    setTimeout(() => {
      document.getElementById('questions-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  if (currentPage === 'admin') {
    return <AdminDashboard />;
  }

  if (currentPage === 'thankyou-qualified') {
    return <ThankYou type="qualified" />;
  }

  if (currentPage === 'thankyou-unqualified') {
    return <ThankYou type="unqualified" />;
  }

  return (
    <div className="min-h-screen bg-white">
      {currentPage === 'qualification' && (
        <QualificationPage
          step={step}
          answers={answers}
          handleAnswer={handleAnswer}
          handleNextStep={handleNextStep}
          canProceed={canProceed()}
          questionsVisible={questionsVisible}
          onRevealQuestions={handleRevealQuestions}
        />
      )}

      {currentPage === 'booking' && <BookingPage calendlyLink={calendlyLink} setCurrentPage={setCurrentPage} />}

      {currentPage === 'nurture' && (
        <NurturePage
          formData={formData}
          setFormData={setFormData}
          handleSubmitLead={handleSubmitLead}
          isSubmitting={isSubmitting}
          submitError={submitError}
        />
      )}
    </div>
  );
}

function QualificationPage({ step, answers, handleAnswer, handleNextStep, canProceed, questionsVisible, onRevealQuestions }: any) {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const testimonials = [
    {
      quote: "Mr. Richard helped me so that I was able to qualify and present the right documentations.",
      initials: "BM",
      name: "Mrs. Beverly Machawi - Zambia"
    },
    {
      quote: "Your child will not only receive assistance with the application process but will also have a mentor to guide and support them all the way through to graduation.",
      initials: "GMW",
      name: "Mrs. Gina Mwango Willey - Zambia, Kitwe"
    },
    {
      quote: "Optimal Student Recruitment made the impossible possible. My daughter received her acceptance letter in just 5 months. We couldn't have done it without their support.",
      initials: "TM",
      name: "Mr. Tembo, Botswana"
    }
  ];

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 9000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const questions = [
    {
      key: 'proofOfFunds' as const,
      icon: DollarSign,
      title: 'Financial Proof (AUD $60K-$70K)',
      description: 'Can your family provide AUD $60,000-$70,000 as evidence of satisfying the financial requirement for the grant of admission and student visa?',
      question: 'Can your family provide AUD $60,000-$70,000 as evidence of satisfying the financial requirement for the grant of admission and student visa?'
    },
    {
      key: 'applicationCosts' as const,
      icon: DollarSign,
      title: 'Application Costs (AUD $15K-$30K)',
      description: 'Can you afford AUD $15K-$30K in application costs (not all upfront)?',
      question: 'Can you afford AUD $15,000-$30,000 in application costs (not all upfront)?'
    },
    {
      key: 'serviceFee' as const,
      icon: CheckCircle,
      title: 'Service Fee (AUD $999)',
      description: 'Can you pay AUD $333 if you want to proceed after your free consultation?',
      question: 'Can you pay AUD $333 if you want to proceed after your free consultation?'
    }
  ];

  const currentQuestion = questions[step - 1];
  const Icon = currentQuestion.icon;
  const currentAnswer = answers[currentQuestion.key];

  return (
    <div className="min-h-screen bg-white">
      <section className="relative min-h-screen text-white px-4 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 w-full h-full">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/Planevideo.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/70"></div>
        </div>
        <div className="max-w-5xl mx-auto text-center relative z-10 py-12 sm:py-16 md:py-20 px-4 sm:px-6 w-full">
          <div className="flex items-center justify-center mb-8 sm:mb-10">
            <img
              src="/image.png"
              alt="Optimal Student Recruitment"
              className="h-20 sm:h-28 w-auto max-w-full object-contain"
            />
          </div>

          <h2 className="text-[2rem] sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 sm:mb-8 leading-[1.3] sm:leading-tight tracking-tight px-2">
            We are helping African parents successfully enrol their children into{' '}
            <span className="text-[#25D366]">TOP AUSTRALIAN UNIVERSITIES & COLLEGES</span>
            <br className="sm:hidden" />
            <span className="block sm:inline mt-1 sm:mt-0"> in just 4 to 6 months</span>
          </h2>
          <p className="text-base sm:text-xl lg:text-2xl text-white/90 mb-10 sm:mb-12 max-w-4xl mx-auto leading-relaxed px-2">
            We've helped over 150 African students from Zambia, Kenya, South Africa, Zimbabwe, Botswana & more get accepted
          </p>

          <button
            onClick={onRevealQuestions}
            className="bg-[#25D366] text-white px-6 py-3 sm:px-8 sm:py-4 rounded-lg text-base sm:text-lg font-bold hover:bg-[#20BD5A] transition-all inline-flex items-center gap-2 shadow-xl hover:shadow-[#25D366]/30 hover:scale-105 transform"
          >
            <span className="text-xl sm:text-2xl">👉</span>
            <div className="flex flex-col items-start">
              <span>Find Out If You Qualify</span>
              <span className="text-xs sm:text-sm font-normal opacity-90">Takes less than 60 seconds</span>
            </div>
          </button>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto mt-8 sm:mt-12">
            <div className="flex flex-col items-center text-center">
              <GraduationCap className="w-8 h-8 sm:w-10 sm:h-10 mb-2 text-[#25D366]" />
              <p className="font-semibold text-white text-xs sm:text-sm">
                150+ students placed
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <Globe className="w-8 h-8 sm:w-10 sm:h-10 mb-2 text-[#25D366]" />
              <p className="font-semibold text-white text-xs sm:text-sm">
                Top Australian universities and colleges
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <FileText className="w-8 h-8 sm:w-10 sm:h-10 mb-2 text-[#25D366]" />
              <p className="font-semibold text-white text-xs sm:text-sm">
                Full visa & documentation support
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <Phone className="w-8 h-8 sm:w-10 sm:h-10 mb-2 text-[#25D366]" />
              <p className="font-semibold text-white text-xs sm:text-sm">
                Free parental consultation
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative min-h-screen py-6 sm:py-10 px-4 bg-white flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <Map className="absolute top-[10%] left-[5%] w-16 h-16 text-[#25D366] opacity-10" />
          <Star className="absolute top-[20%] right-[8%] w-12 h-12 text-[#25D366] opacity-10" />
          <Plane className="absolute top-[15%] right-[20%] w-14 h-14 text-[#25D366] opacity-10 rotate-45" />
          <Globe className="absolute bottom-[15%] left-[10%] w-16 h-16 text-[#25D366] opacity-10" />
          <MapPin className="absolute bottom-[25%] right-[15%] w-12 h-12 text-[#25D366] opacity-10" />
          <Compass className="absolute top-[40%] left-[3%] w-14 h-14 text-[#25D366] opacity-10" />
          <Star className="absolute bottom-[10%] right-[5%] w-10 h-10 text-[#25D366] opacity-10" />
          <Plane className="absolute bottom-[35%] left-[15%] w-12 h-12 text-[#25D366] opacity-10 -rotate-12" />
          <Map className="absolute top-[50%] right-[3%] w-14 h-14 text-[#25D366] opacity-10" />
          <Globe className="absolute top-[30%] left-[20%] w-10 h-10 text-[#25D366] opacity-10" />
        </div>
        <div className="max-w-4xl mx-auto w-full relative z-10">
          <div className="text-center mb-5 sm:mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
              Families Like Yours Are Already Getting Accepted
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Parents across Africa trusted Optimal Student Recruitment to guide their children into top Australian universities and colleges.
            </p>
          </div>

          <div className="relative max-w-3xl mx-auto">
            <div
              className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-8 sm:p-12 shadow-lg relative min-h-[280px] flex flex-col justify-between cursor-pointer select-none"
              onMouseDown={() => setIsPaused(true)}
              onMouseUp={() => setIsPaused(false)}
              onMouseLeave={() => setIsPaused(false)}
              onTouchStart={() => setIsPaused(true)}
              onTouchEnd={() => setIsPaused(false)}
            >
              <Quote className="w-10 h-10 sm:w-12 sm:h-12 text-[#25D366] opacity-20 absolute top-6 right-6" />
              <div className="mb-6">
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed relative z-10">
                  "{testimonials[currentTestimonial].quote}"
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#25D366]/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#25D366] font-bold text-base">{testimonials[currentTestimonial].initials}</span>
                </div>
                <p className="text-sm sm:text-base font-semibold text-gray-900">
                  {testimonials[currentTestimonial].name}
                </p>
              </div>
            </div>

            <button
              onClick={() => setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-6 w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
            </button>

            <button
              onClick={() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-6 w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
            </button>

            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    index === currentTestimonial ? 'bg-[#25D366] w-8' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative min-h-screen py-4 sm:py-8 px-4 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/1454360/pexels-photo-1454360.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="University Campus"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/70 to-black/80"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10 w-full">
          <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2">
            Can your family meet the financial requirements to study in Australia?
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-white/90 max-w-2xl mx-auto mb-8 sm:mb-10">
            Answer 3 quick questions to see if you qualify.
          </p>

          {!questionsVisible && (
            <button
              onClick={onRevealQuestions}
              className="bg-[#25D366] text-white px-6 py-3 sm:px-8 sm:py-4 rounded-lg text-base sm:text-lg font-bold hover:bg-[#20BD5A] transition-all inline-flex items-center gap-2 shadow-xl hover:shadow-[#25D366]/30 hover:scale-105 transform"
            >
              <span className="text-xl sm:text-2xl">👉</span>
              <div className="flex flex-col items-start">
                <span>Find Out If You Qualify</span>
                <span className="text-xs sm:text-sm font-normal opacity-90">Takes less than 60 seconds</span>
              </div>
            </button>
          )}
        </div>
      </section>

      {questionsVisible && (
        <section
          id="questions-section"
          className="min-h-screen py-6 sm:py-12 md:py-16 px-4 bg-gray-50 animate-[fadeIn_0.4s_ease-out] flex items-center justify-center"
          style={{
            animation: 'fadeIn 0.4s ease-out'
          }}
        >
        <div className="max-w-3xl mx-auto w-full">
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 md:p-12">
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <div className="flex items-center space-x-2 sm:space-x-4">
                {[1, 2, 3].map((num) => (
                  <div key={num} className="flex items-center">
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base ${
                        num < step
                          ? 'bg-[#25D366] text-white'
                          : num === step
                          ? 'bg-[#25D366] text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {num < step ? '✓' : num}
                    </div>
                    {num < 3 && (
                      <div
                        className={`w-8 sm:w-12 h-1 ${num < step ? 'bg-[#25D366]' : 'bg-gray-200'}`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center mb-4 sm:mb-6">
              <div className="flex justify-center mb-3 sm:mb-4">
                <div className="bg-[#25D366] p-3 sm:p-4 rounded-full">
                  <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{currentQuestion.title}</h2>
            </div>

            {step === 1 && (
              <div className="mb-4 text-center space-y-3">
                <p className="text-sm sm:text-base text-gray-600">
                  The financial requirement is compulsory for the admission and student visa applications.
                </p>
                <p className="text-sm sm:text-base text-gray-600">
                  This is an estimated amount. The exact amount can only be determined once we know which course and education provider you plan to study with.
                </p>
              </div>
            )}

            {step === 2 && (
              <div className="mb-4 text-center">
                <p className="text-sm sm:text-base text-gray-600 mb-2">
                  This is the amount typically needed during the application process itself.
                </p>
                <p className="text-sm sm:text-base text-gray-600 mb-2">
                  Application costs usually range between AUD $15,000–$30,000 and may include:
                </p>
                <ul className="text-sm sm:text-base text-gray-600 space-y-1 list-none">
                  <li>• Payment of tuition fees for the first teaching period</li>
                  <li>• Cost of health insurance</li>
                  <li>• Visa application fees</li>
                  <li>• English language proficiency test fees</li>
                  <li>• Medical examinations and more</li>
                </ul>
              </div>
            )}

            {step === 3 && (
              <div className="mb-4 text-center">
                <p className="text-sm sm:text-base text-gray-600 mb-2">
                  We support you throughout the entire application process.
                </p>
                <p className="text-sm sm:text-base text-gray-600 mb-2">
                  Our Student Placement Service fee is AUD $999 split into 3 instalments of AUD $333
                </p>
                <p className="text-sm sm:text-base text-gray-900 font-bold">
                  You only need to pay the first AUD $333 after the free consultation to get started
                </p>
              </div>
            )}

            <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
              <p className="text-base sm:text-lg font-semibold text-gray-900 text-center mb-4 sm:mb-6">
                {currentQuestion.question}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <button
                  onClick={() => handleAnswer(currentQuestion.key, true)}
                  className={`px-6 py-3 sm:px-8 sm:py-4 rounded-lg text-base sm:text-lg font-semibold transition-all ${
                    currentAnswer === true
                      ? 'bg-[#25D366] text-white ring-4 ring-[#25D366]/30'
                      : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-[#25D366]'
                  }`}
                >
                  Yes
                </button>
                <button
                  onClick={() => handleAnswer(currentQuestion.key, false)}
                  className={`px-6 py-3 sm:px-8 sm:py-4 rounded-lg text-base sm:text-lg font-semibold transition-all ${
                    currentAnswer === false
                      ? 'bg-[#25D366] text-white ring-4 ring-[#25D366]/30'
                      : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-[#25D366]'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {step === 2 && (
              <div className="mb-4">
                <button
                  onClick={() => setShowBreakdown(!showBreakdown)}
                  className="w-full flex items-center justify-center gap-2 text-sm sm:text-base text-[#25D366] font-semibold hover:text-[#20BD5A] transition-colors mb-4"
                >
                  <span>See full breakdown</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showBreakdown ? 'rotate-180' : ''}`} />
                </button>

                {showBreakdown && (
                  <div className="overflow-x-auto animate-[fadeIn_0.3s_ease-out] mb-4">
                    <table className="w-full text-xs sm:text-sm border-collapse">
                      <thead>
                        <tr className="bg-[#25D366] text-white">
                          <th className="border border-gray-300 px-2 py-2 text-left font-semibold">Stage</th>
                          <th className="border border-gray-300 px-2 py-2 text-left font-semibold">Cost Item</th>
                          <th className="border border-gray-300 px-2 py-2 text-left font-semibold">Amount</th>
                          <th className="border border-gray-300 px-2 py-2 text-left font-semibold">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        <tr>
                          <td className="border border-gray-300 px-2 py-2">Stage 2 – Information Gathering</td>
                          <td className="border border-gray-300 px-2 py-2">OSR Service Fee (Instalment 1)</td>
                          <td className="border border-gray-300 px-2 py-2">AUD 333</td>
                          <td className="border border-gray-300 px-2 py-2">First of three instalments (total AUD 999). Covers pre-admission services.</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-2 py-2">Stage 2 – Information Gathering</td>
                          <td className="border border-gray-300 px-2 py-2">English Language Proficiency Test</td>
                          <td className="border border-gray-300 px-2 py-2">Varies</td>
                          <td className="border border-gray-300 px-2 py-2">Depends on the test (IELTS, PTE, TOEFL). Required by institutions.</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-2 py-2">Stage 5 – Admissions</td>
                          <td className="border border-gray-300 px-2 py-2">OSR Service Fee (Instalment 2)</td>
                          <td className="border border-gray-300 px-2 py-2">AUD 333</td>
                          <td className="border border-gray-300 px-2 py-2">Second instalment of service fee. Covers services rendered for admission.</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-2 py-2">Stage 5 – Admissions</td>
                          <td className="border border-gray-300 px-2 py-2">University/College Application Fees</td>
                          <td className="border border-gray-300 px-2 py-2">AUD 120 – AUD 250 (if applicable)</td>
                          <td className="border border-gray-300 px-2 py-2">Non-refundable. Amount varies by institution.</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-2 py-2">Stage 6 – Acceptance of an Offer</td>
                          <td className="border border-gray-300 px-2 py-2">Overseas Student Health Cover (OSHC)</td>
                          <td className="border border-gray-300 px-2 py-2">Varies</td>
                          <td className="border border-gray-300 px-2 py-2">Cost depends on course duration and number of family members.</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-2 py-2">Stage 6 – Acceptance of an Offer</td>
                          <td className="border border-gray-300 px-2 py-2">Tuition Fee Deposit</td>
                          <td className="border border-gray-300 px-2 py-2">AUD 10,000 – AUD 20,000 (normally)</td>
                          <td className="border border-gray-300 px-2 py-2">Amount varies depending on education provider and course. Required to secure your place.</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-2 py-2">Stage 6 – Acceptance of an Offer</td>
                          <td className="border border-gray-300 px-2 py-2">University/College Application Fees</td>
                          <td className="border border-gray-300 px-2 py-2">AUD 120 – AUD 250 (if applicable)</td>
                          <td className="border border-gray-300 px-2 py-2">If charged at this stage instead of during admissions.</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-2 py-2">Stage 7 – Visa Application</td>
                          <td className="border border-gray-300 px-2 py-2">OSR Service Fee (Final Instalment)</td>
                          <td className="border border-gray-300 px-2 py-2">AUD 333</td>
                          <td className="border border-gray-300 px-2 py-2">Third and final instalment of service fee.</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-2 py-2">Stage 7 – Visa Application</td>
                          <td className="border border-gray-300 px-2 py-2">Visa Application Fee</td>
                          <td className="border border-gray-300 px-2 py-2">From AUD 2,000</td>
                          <td className="border border-gray-300 px-2 py-2">Base fee for primary applicant; higher if spouse/dependents included.</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-2 py-2">Stage 7 – Visa Application</td>
                          <td className="border border-gray-300 px-2 py-2">Health Examination</td>
                          <td className="border border-gray-300 px-2 py-2">Varies</td>
                          <td className="border border-gray-300 px-2 py-2">Cost depends on country and clinic. Mandatory for visa approval.</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-2 py-2">Stage 8 – Pre-Departure</td>
                          <td className="border border-gray-300 px-2 py-2">Flights to Australia</td>
                          <td className="border border-gray-300 px-2 py-2">Varies</td>
                          <td className="border border-gray-300 px-2 py-2">Cost depends on airline, booking time, and departure country.</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-2 py-2">Stage 8 – Pre-Departure</td>
                          <td className="border border-gray-300 px-2 py-2">Temporary or On-Campus Accommodation</td>
                          <td className="border border-gray-300 px-2 py-2">Varies</td>
                          <td className="border border-gray-300 px-2 py-2">Initial accommodation on arrival; cost depends on location and type.</td>
                        </tr>
                        <tr className="bg-yellow-100">
                          <td className="border border-gray-300 px-2 py-2 font-bold" colspan="2">Total Estimated Costs</td>
                          <td className="border border-gray-300 px-2 py-2 font-bold">AUD 15,000 – AUD 30,000+</td>
                          <td className="border border-gray-300 px-2 py-2 font-bold">Indicative range only. Actual costs depend on test choice, university, course, etc.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleNextStep}
              disabled={!canProceed}
              className={`w-full py-3 sm:py-4 rounded-lg text-base sm:text-lg font-bold transition-all ${
                canProceed
                  ? 'bg-[#25D366] text-white hover:bg-[#20BD5A] cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {step === 3 ? 'Submit' : 'Continue'}
              {step === 3 && <ArrowRight className="inline-block ml-2 w-5 h-5" />}
            </button>
          </div>
        </div>
      </section>
      )}
    </div>
  );
}

function BookingPage({ calendlyLink, setCurrentPage }: { calendlyLink: string; setCurrentPage: (page: Page) => void }) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const existingScript = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]');

    if (existingScript) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    script.type = 'text/javascript';
    document.head.appendChild(script);

    script.onload = () => {
      console.log('Calendly script loaded successfully');
    };

    script.onerror = () => {
      console.error('Failed to load Calendly script');
    };

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    const handleCalendlyEvent = (e: MessageEvent) => {
      if (e.data.event && e.data.event === 'calendly.event_scheduled') {
        setCurrentPage('thankyou-qualified');
      }
    };

    window.addEventListener('message', handleCalendlyEvent);

    return () => {
      window.removeEventListener('message', handleCalendlyEvent);
    };
  }, [setCurrentPage]);

  const faqs = [
    {
      question: "Do you offer scholarships?",
      answer: "Partial scholarships may be available for some coursework programs (Certificates, Diplomas, Bachelor Degrees, and Masters Degrees). Even if a partial scholarship is available, the financial requirements for the application and visa process must still be met."
    },
    {
      question: "Can I afford this process?",
      answer: "We'll walk through all costs transparently in your student Counselling session. If necessary we can explore options that may work for your family."
    },
    {
      question: "How long does it take?",
      answer: "From consultation to course start is typically 4-6 months. This includes selecting the right course, lodging applications, visa processing, and pre-departure preparation."
    },
    {
      question: "What if I don't have all the money now?",
      answer: "To get started, all you need is AUD$333 to be paid after your free consultation. The rest of the application costs will become due later in the process. Let us discuss your financial situation in the Student Counselling session to determine the best way forward"
    },
    {
      question: "Is my child guaranteed admission?",
      answer: "While we have a 97% success rate for students who meet academic and financial requirements, admission depends on meeting university criteria and visa conditions. We'll assess your child's profile during the consultation."
    },
    {
      question: "What if we need more time before applying?",
      answer: "No problem. The consultation is about understanding your options and timeline. There's no pressure to proceed immediately after the consultation - we will work at your family's pace and apply for a corresponding intake."
    }
  ];

  const testimonials = [
    {
      quote: "Mr. Richard helped me so that I was able to qualify and present the right documentations.",
      author: "Mrs. Beverly Machawi - Zambia"
    },
    {
      quote: "Your child will not only receive assistance with the application process but will also have a mentor to guide and support them all the way through to graduation.",
      author: "Mrs. Gina Mwango Willey - Zambia, Kitwe"
    },
    {
      quote: "The consultation gave us so much clarity. We knew exactly what we needed to do next.",
      author: "Parent from Zimbabwe"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-8">
              <img
                src="/image.png"
                alt="Optimal Student Recruitment"
                className="h-16 sm:h-20 w-auto max-w-full object-contain"
              />
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              You're Eligible - Let's Get Started Together
            </h2>
            <p className="text-xl text-white/90 mb-2">
              Book your free consultation with an Optimal Student Recruitment Counsellor
            </p>
            <p className="text-lg text-white/80 mb-8">
              We require both student and parent/sponsor to attend.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 sm:p-8">
            <p className="text-white/90 text-lg mb-6 leading-relaxed">
              We're currently helping <span className="font-bold text-[#25D366]">African parents</span> secure spots for their children at top Australian universities and colleges - in just 4-6 months.
            </p>

            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-[#25D366] flex-shrink-0 mt-0.5" />
                <p className="text-white/90">
                  Zero commitment - this session is completely free to see if it's the right fit
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-[#25D366] flex-shrink-0 mt-0.5" />
                <p className="text-white/90">
                  Trusted by 150+ families from Zambia, Kenya, South Africa, Zimbabwe, Botswana & more
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-[#25D366] flex-shrink-0 mt-0.5" />
                <p className="text-white/90">
                  97% success rate for students who meet financial & academic requirements
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-[#25D366] flex-shrink-0 mt-0.5" />
                <p className="text-white/90">
                  Full support: course selection, visa process & documents
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-xl p-5 mt-8 text-center">
            <p className="text-red-900 font-bold text-lg flex items-center justify-center gap-2">
              <AlertCircle className="w-6 h-6" />
              Only 10 early-access consultation spots available this month. These fill quickly - book now to secure yours.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Secure Your Consultation Spot Below
            </h2>
            <p className="text-lg text-gray-600">
              Both student and parent/sponsor must attend the session.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
            <div
              className="calendly-inline-widget"
              data-url={calendlyLink}
              style={{ minWidth: '320px', height: '700px', width: '100%' }}
            ></div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-12 text-center">
            What Other Parents Are Saying
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-6 relative">
                <Quote className="w-10 h-10 text-[#25D366] opacity-20 absolute top-4 right-4" />
                <p className="text-gray-700 leading-relaxed mb-4 relative z-10">
                  "{testimonial.quote}"
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  - {testimonial.author}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 text-center">
            Common Questions
          </h2>
          <p className="text-lg text-gray-600 mb-10 text-center">
            (Answered in Your Session)
          </p>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 text-lg pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-600 flex-shrink-0 transition-transform ${
                      openFaqIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaqIndex === index && (
                  <div className="px-6 pb-5 pt-2 text-gray-700 leading-relaxed border-t border-gray-100">
                    {faq.question === "What if I don't have all the money now?" ? (
                      <>
                        <span className="font-bold text-[#25D366]">
                          To get started, all you need is AUD$333 to be paid AFTER your free consultation.
                        </span>
                        {" "}The rest of the application costs will become due later in the process. Let us discuss your financial situation in the Student Counselling session to determine the best way forward
                      </>
                    ) : (
                      faq.answer
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 text-center bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
            <p className="text-blue-900 font-semibold text-lg">
              Still unsure? That's okay.. Book your session and we'll walk you through everything you need
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function NurturePage({ formData, setFormData, handleSubmitLead, isSubmitting, submitError }: any) {
  const [showCustomPhoneCode, setShowCustomPhoneCode] = useState(false);
  const [showCustomTextCode, setShowCustomTextCode] = useState(false);

  const handlePhoneCodeChange = (value: string) => {
    if (value === 'custom') {
      setShowCustomPhoneCode(true);
      setFormData({ ...formData, phoneCountryCode: '' });
    } else {
      setShowCustomPhoneCode(false);
      setFormData({ ...formData, phoneCountryCode: value });
    }
  };

  const handleTextCodeChange = (value: string) => {
    if (value === 'custom') {
      setShowCustomTextCode(true);
      setFormData({ ...formData, textMessageCountryCode: '' });
    } else {
      setShowCustomTextCode(false);
      setFormData({ ...formData, textMessageCountryCode: value });
    }
  };

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
          <source src="https://cdn.pixabay.com/video/2022/10/23/136205-765033813_large.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-slate-800/85 to-slate-900/85"></div>
      </div>

      <div className="max-w-2xl w-full relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-8">
            <img
              src="/image.png"
              alt="Optimal Student Recruitment"
              className="h-20 sm:h-28 w-auto max-w-full object-contain"
            />
          </div>
          <div className="text-6xl mb-6">💡</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Not Quite Ready Financially?
          </h2>
          <p className="text-xl text-gray-300">
            That's okay. We'll send you useful information and resources so when you're ready - we're here to help.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Enter Details</h2>
          <form onSubmit={handleSubmitLead} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-gray-900 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#25D366] focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold text-gray-900 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#25D366] focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#25D366] focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-900 mb-2">
                Phone Number *
              </label>
              {!showCustomPhoneCode ? (
                <div className="flex gap-2">
                  <CountryCodeSelect
                    value={formData.phoneCountryCode}
                    onChange={handlePhoneCodeChange}
                    countries={worldwideCountryCodes}
                    className="w-32 flex-shrink-0"
                  />
                  <input
                    type="tel"
                    id="phoneNumber"
                    required
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="flex-1 min-w-0 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#25D366] focus:border-transparent outline-none transition-all"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.phoneCountryCode}
                      onChange={(e) => setFormData({ ...formData, phoneCountryCode: e.target.value })}
                      className="w-24 px-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#25D366] focus:border-transparent outline-none transition-all flex-shrink-0"
                      placeholder="+123"
                      required
                    />
                    <input
                      type="tel"
                      id="phoneNumber"
                      required
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="flex-1 min-w-0 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#25D366] focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomPhoneCode(false);
                      setFormData({ ...formData, phoneCountryCode: '+234' });
                    }}
                    className="text-sm text-[#25D366] hover:text-[#20BD5A] font-semibold"
                  >
                    Select from list
                  </button>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="isWhatsappConnected" className="block text-sm font-semibold text-gray-900 mb-2">
                Is this phone number connected to WhatsApp? *
              </label>
              <select
                id="isWhatsappConnected"
                required
                value={formData.isWhatsappConnected}
                onChange={(e) => setFormData({ ...formData, isWhatsappConnected: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#25D366] focus:border-transparent outline-none transition-all bg-white appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2325D366'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
              >
                <option value="">Select...</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div>
              <label htmlFor="countryOfResidence" className="block text-sm font-semibold text-gray-900 mb-2">
                What country do you currently live in? *
              </label>
              <input
                type="text"
                id="countryOfResidence"
                required
                value={formData.countryOfResidence}
                onChange={(e) => setFormData({ ...formData, countryOfResidence: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#25D366] focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label htmlFor="textMessagePhone" className="block text-sm font-semibold text-gray-900 mb-2">
                Send text messages to
              </label>
              {!showCustomTextCode ? (
                <div className="flex gap-2">
                  <CountryCodeSelect
                    value={formData.textMessageCountryCode}
                    onChange={handleTextCodeChange}
                    countries={worldwideCountryCodes}
                    className="w-32 flex-shrink-0"
                  />
                  <input
                    type="tel"
                    id="textMessagePhone"
                    value={formData.textMessagePhone}
                    onChange={(e) => setFormData({ ...formData, textMessagePhone: e.target.value })}
                    className="flex-1 min-w-0 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#25D366] focus:border-transparent outline-none transition-all"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.textMessageCountryCode}
                      onChange={(e) => setFormData({ ...formData, textMessageCountryCode: e.target.value })}
                      className="w-24 px-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#25D366] focus:border-transparent outline-none transition-all flex-shrink-0"
                      placeholder="+123"
                    />
                    <input
                      type="tel"
                      id="textMessagePhone"
                      value={formData.textMessagePhone}
                      onChange={(e) => setFormData({ ...formData, textMessagePhone: e.target.value })}
                      className="flex-1 min-w-0 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#25D366] focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomTextCode(false);
                      setFormData({ ...formData, textMessageCountryCode: '+234' });
                    }}
                    className="text-sm text-[#25D366] hover:text-[#20BD5A] font-semibold"
                  >
                    Select from list
                  </button>
                </div>
              )}
            </div>

            {submitError && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800 text-sm">{submitError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 rounded-lg text-lg font-bold transition-all ${
                isSubmitting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#25D366] text-white hover:bg-[#20BD5A]'
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Keep Me Updated'}
            </button>
          </form>

          <p className="text-center text-gray-600 text-sm mt-6">
            Just real guidance to help you prepare for studying in Australia.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
