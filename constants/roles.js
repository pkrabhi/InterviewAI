export const ROLES = [
  {
    id: 'java',
    label: 'Java Backend',
    emoji: '☕',
    topics: ['Spring Boot', 'Microservices', 'JPA/Hibernate'],
  },
  {
    id: 'fullstack',
    label: 'Full Stack',
    emoji: '🧩',
    topics: ['React', 'Node.js', 'REST APIs'],
  },
  {
    id: 'data',
    label: 'Data Engineer',
    emoji: '📊',
    topics: ['SQL', 'Spark', 'ETL Pipelines'],
  },
  {
    id: 'devops',
    label: 'DevOps',
    emoji: '⚙️',
    topics: ['Docker', 'Kubernetes', 'CI/CD'],
  },
  {
    id: 'react',
    label: 'React Developer',
    emoji: '⚛️',
    topics: ['React Hooks', 'Redux', 'Performance'],
  },
  {
    id: 'python',
    label: 'Python Backend',
    emoji: '🐍',
    topics: ['Django/FastAPI', 'Async & GIL', 'Pandas/NumPy'],
  },
  {
    id: 'node',
    label: 'Node.js Backend',
    emoji: '💚',
    topics: ['Express/NestJS', 'Event Loop', 'Async Patterns'],
  },
  {
    id: 'dotnet',
    label: '.NET / C#',
    emoji: '🔷',
    topics: ['ASP.NET Core', 'Entity Framework', 'LINQ'],
  },
  {
    id: 'hr',
    label: 'HR Round',
    emoji: '🤝',
    topics: ['Behavioural', 'Situational', 'Salary Negotiation'],
  },
];

export const LEVELS = ['Junior', 'Mid', 'Senior'];

export const INTERVIEW_TYPES = [
  { id: 'technical',     label: 'Technical',      emoji: '💻' },
  { id: 'hr',            label: 'HR',              emoji: '🤝' },
  { id: 'system_design', label: 'System Design',   emoji: '🏗️' },
  { id: 'mixed',         label: 'Mixed',            emoji: '🎯' },
];

export const LENGTHS = [
  { id: 'quick',    label: 'Quick',    sub: '~5 Qs',  questions: 5 },
  { id: 'standard', label: 'Standard', sub: '~8 Qs',  questions: 8 },
  { id: 'full',     label: 'Full',     sub: '~12 Qs', questions: 12 },
];
