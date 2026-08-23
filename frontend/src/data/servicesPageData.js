export const serviceCategories = [
  { id: 'all', label: 'All Services' },
  { id: 'specialty', label: 'Specialty Care' },
  { id: 'diagnostic', label: 'Diagnostics' },
  { id: 'preventive', label: 'Preventive' },
]

export const servicesCatalog = [
  {
    id: 'cardiology',
    icon: '🫀',
    title: 'Cardiology',
    category: 'specialty',
    description: 'Heart health screenings, diagnostics, and personalized treatment plans.',
    longDescription:
      'Our cardiology team uses advanced imaging and non-invasive testing to detect heart conditions early and build tailored care plans for every patient.',
    features: ['ECG & stress testing', 'Echocardiography', 'Hypertension management', 'Post-surgery follow-up'],
    duration: '45–60 min',
    availability: 'Mon – Sat',
    popular: true,
    accent: '#e11d48',
  },
  {
    id: 'orthopedics',
    icon: '🦴',
    title: 'Orthopedics',
    category: 'specialty',
    description: 'Bone, joint, and muscle care with advanced rehabilitation support.',
    longDescription:
      'From sports injuries to chronic joint pain, our orthopedic specialists combine surgical expertise with structured rehab programs.',
    features: ['Joint & spine care', 'Sports injury treatment', 'Physical therapy plans', 'Minimally invasive options'],
    duration: '30–45 min',
    availability: 'Mon – Fri',
    popular: true,
    accent: '#0a4d8c',
  },
  {
    id: 'pediatrics',
    icon: '👶',
    title: 'Pediatrics',
    category: 'specialty',
    description: 'Gentle, specialized healthcare for infants, children, and teens.',
    longDescription:
      'Child-friendly consultations covering growth monitoring, vaccinations, and developmental assessments in a calm environment.',
    features: ['Well-child visits', 'Immunizations', 'Growth tracking', 'Nutrition guidance'],
    duration: '30 min',
    availability: 'Mon – Sat',
    popular: false,
    accent: '#8b5cf6',
  },
  {
    id: 'dental',
    icon: '🦷',
    title: 'Dental Care',
    category: 'preventive',
    description: 'Preventive, cosmetic, and restorative dentistry under one roof.',
    longDescription:
      'Complete oral health services including cleanings, fillings, whitening, and restorative procedures with modern digital imaging.',
    features: ['Routine cleanings', 'Cosmetic dentistry', 'Root canal therapy', 'Digital X-rays'],
    duration: '45–90 min',
    availability: 'Mon – Fri',
    popular: false,
    accent: '#0891b2',
  },
  {
    id: 'eye-care',
    icon: '👁️',
    title: 'Eye Care',
    category: 'specialty',
    description: 'Vision testing, eye disease management, and surgical options.',
    longDescription:
      'Comprehensive eye exams, glaucoma screening, and corrective lens prescriptions from experienced ophthalmologists.',
    features: ['Vision screening', 'Glaucoma checks', 'Contact lens fitting', 'Cataract evaluation'],
    duration: '30–45 min',
    availability: 'Tue – Sat',
    popular: false,
    accent: '#059669',
  },
  {
    id: 'laboratory',
    icon: '🧪',
    title: 'Laboratory',
    category: 'diagnostic',
    description: 'Accurate lab tests with fast turnaround and digital reports.',
    longDescription:
      'On-site lab with automated analyzers for blood work, urinalysis, and specialized panels — results delivered digitally within 24–48 hours.',
    features: ['Blood panels', 'Urinalysis', 'Allergy testing', 'Digital result portal'],
    duration: '15–30 min',
    availability: 'Daily',
    popular: true,
    accent: '#d97706',
  },
  {
    id: 'general-medicine',
    icon: '🩺',
    title: 'General Medicine',
    category: 'preventive',
    description: 'Primary care for everyday health concerns and chronic condition management.',
    longDescription:
      'Your first point of contact for checkups, minor illnesses, and ongoing management of diabetes, asthma, and other chronic conditions.',
    features: ['Annual physicals', 'Chronic care plans', 'Prescription refills', 'Referral coordination'],
    duration: '20–30 min',
    availability: 'Mon – Sat',
    popular: false,
    accent: '#0a4d8c',
  },
  {
    id: 'radiology',
    icon: '📡',
    title: 'Radiology & Imaging',
    category: 'diagnostic',
    description: 'X-ray, ultrasound, and MRI services with same-day scheduling.',
    longDescription:
      'State-of-the-art imaging equipment operated by certified radiologists for fast, accurate diagnostic results.',
    features: ['Digital X-ray', 'Ultrasound', 'MRI referrals', 'Same-day reports'],
    duration: '20–60 min',
    availability: 'Mon – Sat',
    popular: false,
    accent: '#6366f1',
  },
  {
    id: 'wellness',
    icon: '🌿',
    title: 'Wellness & Prevention',
    category: 'preventive',
    description: 'Health screenings, nutrition counseling, and lifestyle coaching.',
    longDescription:
      'Proactive programs designed to help you stay healthy with personalized nutrition plans, fitness guidance, and preventive screenings.',
    features: ['Health risk assessment', 'Nutrition counseling', 'Weight management', 'Smoking cessation'],
    duration: '45 min',
    availability: 'Mon – Fri',
    popular: false,
    accent: '#00b89c',
  },
]

export const careProcess = [
  { step: '01', title: 'Book Online', description: 'Choose your service and pick a convenient time slot in minutes.' },
  { step: '02', title: 'Consultation', description: 'Meet with a specialist who listens and explains your options clearly.' },
  { step: '03', title: 'Personalized Plan', description: 'Receive a tailored treatment or care plan built around your needs.' },
  { step: '04', title: 'Follow-Up Care', description: 'Track progress with scheduled check-ins and digital health records.' },
]

export const serviceHighlights = [
  { icon: '⚡', title: 'Same-Day Appointments', description: 'Most services available within 24 hours' },
  { icon: '🏥', title: 'Modern Facilities', description: 'Fully equipped labs and treatment rooms' },
  { icon: '👨‍⚕️', title: 'Expert Specialists', description: 'Board-certified doctors across departments' },
  { icon: '📱', title: 'Digital Reports', description: 'Access results and records online anytime' },
]
