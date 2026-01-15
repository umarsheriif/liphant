import { Header, Footer } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    category: 'General',
    questions: [
      {
        question: 'What is Liphant?',
        answer: 'Liphant is a platform that connects families with qualified shadow teachers, therapists, and therapy centers specializing in supporting children with special needs. We make it easy to find, book, and manage sessions with verified professionals.',
      },
      {
        question: 'How does Liphant verify professionals?',
        answer: 'All teachers and therapy centers on Liphant go through a verification process that includes credential verification, background checks, and review of experience and qualifications. Verified professionals display a verification badge on their profile.',
      },
      {
        question: 'Is Liphant available in my area?',
        answer: 'Liphant is currently available in Egypt, with a focus on Cairo and Alexandria. We are continuously expanding to new areas. Check the search feature to see available professionals near you.',
      },
    ],
  },
  {
    category: 'For Parents',
    questions: [
      {
        question: 'How do I find a teacher for my child?',
        answer: 'Use our search feature to browse teachers by location, specialization, availability, and rating. You can view detailed profiles, read reviews from other parents, and message teachers directly before booking.',
      },
      {
        question: 'How do I book a session?',
        answer: 'Once you find a suitable teacher, view their availability calendar and select a time slot. Fill in any relevant notes about your child\'s needs, and submit the booking request. The teacher will confirm or suggest alternatives.',
      },
      {
        question: 'What if I need to cancel a booking?',
        answer: 'Cancellation policies vary by provider and are displayed when you book. Generally, cancellations made 24-48 hours in advance are fully refundable. Check the specific provider\'s policy for details.',
      },
      {
        question: 'How do reviews work?',
        answer: 'After each completed session, you can leave a rating and review. Reviews help other families make informed decisions and help teachers improve their services. Please be honest and constructive in your feedback.',
      },
    ],
  },
  {
    category: 'For Teachers',
    questions: [
      {
        question: 'How do I join Liphant as a teacher?',
        answer: 'Click "Join as Teacher" and create an account. Complete your profile with your qualifications, experience, and specializations. Submit required documents for verification. Once approved, you can start receiving booking requests.',
      },
      {
        question: 'How do I set my availability?',
        answer: 'Go to your dashboard and navigate to "Availability." You can set your weekly schedule, block specific dates, and update your availability in real-time. Parents can only book during your available times.',
      },
      {
        question: 'How and when do I get paid?',
        answer: 'Payments are processed after each completed session. Funds are transferred to your registered bank account within 3-5 business days. You can track all payments in your dashboard.',
      },
      {
        question: 'What are Liphant\'s fees?',
        answer: 'Liphant charges a service fee of 10-15% on each booking to cover platform costs, payment processing, and support services. The exact fee is displayed when setting your rates.',
      },
    ],
  },
  {
    category: 'For Therapy Centers',
    questions: [
      {
        question: 'How can my center join Liphant?',
        answer: 'Register as a Therapy Center and provide your center\'s information, services, and credentials. Our team will verify your center and help you set up your profile. Once approved, parents can discover and book services at your center.',
      },
      {
        question: 'Can I manage multiple therapists under my center?',
        answer: 'Yes! Center admins can invite therapists to join their center, manage their profiles, view combined analytics, and handle bookings centrally.',
      },
      {
        question: 'How do center bookings work?',
        answer: 'Parents can book sessions with specific therapists at your center or request the next available appointment. You can manage all bookings through your center dashboard.',
      },
    ],
  },
  {
    category: 'Community',
    questions: [
      {
        question: 'What is the Liphant Community?',
        answer: 'The Liphant Community is a space for parents to connect, share experiences, and support each other. It includes forums organized by topic, community events like playdates and workshops, and resources shared by other families.',
      },
      {
        question: 'How do I join community events?',
        answer: 'Browse upcoming events in the Community section. Click on an event to see details and RSVP. Some events are in-person meetups while others are online webinars or workshops.',
      },
      {
        question: 'Can I create my own community event?',
        answer: 'Yes! Registered parents can create events like playdates, support groups, or informal meetups. Navigate to Community > Events > Create Event to get started.',
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold">Frequently Asked Questions</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Find answers to common questions about Liphant
            </p>
          </div>

          <div className="mt-12 space-y-8">
            {faqs.map((category) => (
              <div key={category.category}>
                <h2 className="mb-4 text-2xl font-semibold">{category.category}</h2>
                <div className="space-y-4">
                  {category.questions.map((faq, index) => (
                    <Card key={index}>
                      <CardHeader className="cursor-pointer">
                        <CardTitle className="flex items-center justify-between text-lg">
                          {faq.question}
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{faq.answer}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <Card className="mt-12 bg-primary/5">
            <CardContent className="py-8 text-center">
              <h3 className="text-xl font-semibold">Still have questions?</h3>
              <p className="mt-2 text-muted-foreground">
                Can&apos;t find what you&apos;re looking for? Our support team is here to help.
              </p>
              <div className="mt-4 flex justify-center gap-4">
                <a
                  href="/contact"
                  className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
                >
                  Contact Support
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
