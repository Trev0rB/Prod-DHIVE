// Demo catalog ported from the original DHIVE prototype (DHIVE--MARKETPLACE).
// USD prices from the prototype are converted to ZAR (v1 is rand-only).
// Used only when Supabase env vars are not set, so the app runs out of the box.
import type { Category, Product } from "./types";

export const DEMO_CATEGORIES: Category[] = [
  { slug: "ai-automation", name: "AI & Automation", icon: "🤖" },
  { slug: "templates", name: "Templates", icon: "📄" },
  { slug: "courses", name: "Online Courses", icon: "🎓" },
  { slug: "ebooks", name: "Ebooks", icon: "📚" },
  { slug: "plugins", name: "Plugins", icon: "🧩" },
  { slug: "subscriptions", name: "Subscriptions", icon: "🔁" },
  { slug: "free-tools", name: "Free Tools", icon: "🎁" },
];

export const DEMO_PRODUCTS: Product[] = [
  {
    "id": "demo-0",
    "slug": "free-ai-audit-tool",
    "title": "Free AI Audit Tool",
    "summary": "Identify where AI fits best in your business - no credit card required",
    "description": "Identify where AI fits best in your business - no credit card required. Ships with setup notes and works with Email, Web Form, Dashboard.",
    "categorySlug": "free-tools",
    "priceCents": 0,
    "currency": "ZAR",
    "icon": "🔍",
    "imageUrl": null,
    "integrations": [
      "Email",
      "Web Form",
      "Dashboard"
    ],
    "sellerPayoutsReady": true,
    "sellerName": "DHIVE",
    "featured": false,
    "createdAt": "2026-10-01T08:00:00.000Z"
  },
  {
    "id": "demo-1",
    "slug": "lead-generation-chatbot",
    "title": "Lead Generation Chatbot",
    "summary": "WhatsApp lead qualifier that captures & scores leads 24/7",
    "description": "WhatsApp lead qualifier that captures & scores leads 24/7. Ships with setup notes and works with WhatsApp, Telegram, Web Chat.",
    "categorySlug": "ai-automation",
    "priceCents": 250000,
    "currency": "ZAR",
    "icon": "🤖",
    "imageUrl": null,
    "integrations": [
      "WhatsApp",
      "Telegram",
      "Web Chat"
    ],
    "sellerPayoutsReady": true,
    "sellerName": "DHIVE",
    "featured": true,
    "createdAt": "2026-09-30T08:00:00.000Z"
  },
  {
    "id": "demo-4",
    "slug": "customer-support-ai-bot",
    "title": "Customer Support AI Bot",
    "summary": "24/7 automated customer support that never sleeps",
    "description": "24/7 automated customer support that never sleeps. Ships with setup notes and works with Facebook Messenger, Slack, WhatsApp.",
    "categorySlug": "ai-automation",
    "priceCents": 350000,
    "currency": "ZAR",
    "icon": "💬",
    "imageUrl": null,
    "integrations": [
      "Facebook Messenger",
      "Slack",
      "WhatsApp"
    ],
    "sellerPayoutsReady": true,
    "sellerName": "DHIVE",
    "featured": true,
    "createdAt": "2026-09-29T08:00:00.000Z"
  },
  {
    "id": "demo-6",
    "slug": "job-application-automation",
    "title": "Job Application Automation",
    "summary": "Auto-apply to 100+ jobs daily while you sleep",
    "description": "Auto-apply to 100+ jobs daily while you sleep. Ships with setup notes and works with LinkedIn, Indeed, Email.",
    "categorySlug": "ai-automation",
    "priceCents": 49900,
    "currency": "ZAR",
    "icon": "🎯",
    "imageUrl": null,
    "integrations": [
      "LinkedIn",
      "Indeed",
      "Email"
    ],
    "sellerPayoutsReady": true,
    "sellerName": "JobHelper",
    "featured": true,
    "createdAt": "2026-09-28T08:00:00.000Z"
  },
  {
    "id": "demo-9",
    "slug": "content-writing-ai",
    "title": "Content Writing AI",
    "summary": "SEO-optimized article generator that ranks",
    "description": "SEO-optimized article generator that ranks. Ships with setup notes and works with WordPress, Medium, Email.",
    "categorySlug": "ai-automation",
    "priceCents": 199900,
    "currency": "ZAR",
    "icon": "✍️",
    "imageUrl": null,
    "integrations": [
      "WordPress",
      "Medium",
      "Email"
    ],
    "sellerPayoutsReady": true,
    "sellerName": "WritePro",
    "featured": true,
    "createdAt": "2026-09-27T08:00:00.000Z"
  },
  {
    "id": "demo-11",
    "slug": "email-sequence-automation",
    "title": "Email Sequence Automation",
    "summary": "Automated nurture campaigns that convert",
    "description": "Automated nurture campaigns that convert. Ships with setup notes and works with Mailchimp, ActiveCampaign, ConvertKit.",
    "categorySlug": "ai-automation",
    "priceCents": 129900,
    "currency": "ZAR",
    "icon": "📬",
    "imageUrl": null,
    "integrations": [
      "Mailchimp",
      "ActiveCampaign",
      "ConvertKit"
    ],
    "sellerPayoutsReady": true,
    "sellerName": "EmailPro",
    "featured": false,
    "createdAt": "2026-09-26T08:00:00.000Z"
  },
  {
    "id": "demo-12",
    "slug": "lead-scoring-engine",
    "title": "Lead Scoring Engine",
    "summary": "Qualify leads automatically with AI precision",
    "description": "Qualify leads automatically with AI precision. Ships with setup notes and works with Salesforce, HubSpot, Pipedrive.",
    "categorySlug": "ai-automation",
    "priceCents": 299900,
    "currency": "ZAR",
    "icon": "⭐",
    "imageUrl": null,
    "integrations": [
      "Salesforce",
      "HubSpot",
      "Pipedrive"
    ],
    "sellerPayoutsReady": true,
    "sellerName": "SalesAI",
    "featured": false,
    "createdAt": "2026-09-25T08:00:00.000Z"
  },
  {
    "id": "demo-13",
    "slug": "time-tracking-bot",
    "title": "Time Tracking Bot",
    "summary": "Automatic time logging for remote teams",
    "description": "Automatic time logging for remote teams. Ships with setup notes and works with Slack, Teams, Email.",
    "categorySlug": "ai-automation",
    "priceCents": 59900,
    "currency": "ZAR",
    "icon": "⏱️",
    "imageUrl": null,
    "integrations": [
      "Slack",
      "Teams",
      "Email"
    ],
    "sellerPayoutsReady": true,
    "sellerName": "ProductivityTools",
    "featured": false,
    "createdAt": "2026-09-24T08:00:00.000Z"
  },
  {
    "id": "demo-14",
    "slug": "interview-prep-ai",
    "title": "Interview Prep AI",
    "summary": "Practice with AI interviewer, get feedback",
    "description": "Practice with AI interviewer, get feedback. Ships with setup notes and works with Video Call, Email, PDF Export.",
    "categorySlug": "ai-automation",
    "priceCents": 39900,
    "currency": "ZAR",
    "icon": "🎤",
    "imageUrl": null,
    "integrations": [
      "Video Call",
      "Email",
      "PDF Export"
    ],
    "sellerPayoutsReady": true,
    "sellerName": "CareerBoost",
    "featured": false,
    "createdAt": "2026-09-23T08:00:00.000Z"
  },
  {
    "id": "demo-15",
    "slug": "customer-sentiment-analyzer",
    "title": "Customer Sentiment Analyzer",
    "summary": "Analyze customer emotions in real-time",
    "description": "Analyze customer emotions in real-time. Ships with setup notes and works with Twitter, Facebook, Email, Surveys.",
    "categorySlug": "ai-automation",
    "priceCents": 179900,
    "currency": "ZAR",
    "icon": "😊",
    "imageUrl": null,
    "integrations": [
      "Twitter",
      "Facebook",
      "Email",
      "Surveys"
    ],
    "sellerPayoutsReady": true,
    "sellerName": "SentimentAI",
    "featured": false,
    "createdAt": "2026-09-22T08:00:00.000Z"
  },
  {
    "id": "demo-2",
    "slug": "email-marketing-template",
    "title": "Email Marketing Template",
    "summary": "Professional HTML email templates that convert",
    "description": "Professional HTML email templates that convert. Ships with setup notes and works with Gmail, Mailchimp, ConvertKit.",
    "categorySlug": "templates",
    "priceCents": 19900,
    "currency": "ZAR",
    "icon": "📧",
    "imageUrl": null,
    "integrations": [
      "Gmail",
      "Mailchimp",
      "ConvertKit"
    ],
    "sellerPayoutsReady": true,
    "sellerName": "TemplateHub",
    "featured": false,
    "createdAt": "2026-09-21T08:00:00.000Z"
  },
  {
    "id": "demo-10",
    "slug": "excel-dashboard-templates",
    "title": "Excel Dashboard Templates",
    "summary": "20+ ready-to-use business dashboards",
    "description": "20+ ready-to-use business dashboards. Ships with setup notes and works with Excel, Google Sheets.",
    "categorySlug": "templates",
    "priceCents": 14900,
    "currency": "ZAR",
    "icon": "📈",
    "imageUrl": null,
    "integrations": [
      "Excel",
      "Google Sheets"
    ],
    "sellerPayoutsReady": true,
    "sellerName": "ExcelPro",
    "featured": false,
    "createdAt": "2026-09-20T08:00:00.000Z"
  },
  {
    "id": "demo-3",
    "slug": "python-web-development",
    "title": "Python Web Development",
    "summary": "Complete beginner to advanced course",
    "description": "Complete beginner to advanced course. Ships with setup notes and works with Udemy, Self-Hosted.",
    "categorySlug": "courses",
    "priceCents": 59900,
    "currency": "ZAR",
    "icon": "🐍",
    "imageUrl": null,
    "integrations": [
      "Udemy",
      "Self-Hosted"
    ],
    "sellerPayoutsReady": true,
    "sellerName": "CodeMaster",
    "featured": false,
    "createdAt": "2026-09-19T08:00:00.000Z"
  },
  {
    "id": "demo-5",
    "slug": "affiliate-marketing-ebook",
    "title": "Affiliate Marketing Ebook",
    "summary": "200-page comprehensive guide to earning",
    "description": "200-page comprehensive guide to earning. Ships with setup notes and works with PDF, Email.",
    "categorySlug": "ebooks",
    "priceCents": 9900,
    "currency": "ZAR",
    "icon": "📚",
    "imageUrl": null,
    "integrations": [
      "PDF",
      "Email"
    ],
    "sellerPayoutsReady": true,
    "sellerName": "MarketingGuru",
    "featured": false,
    "createdAt": "2026-09-18T08:00:00.000Z"
  },
  {
    "id": "demo-7",
    "slug": "wordpress-seo-plugin",
    "title": "WordPress SEO Plugin",
    "summary": "Boost your site rankings automatically",
    "description": "Boost your site rankings automatically. Ships with setup notes and works with WordPress, Google Search Console.",
    "categorySlug": "plugins",
    "priceCents": 7900,
    "currency": "ZAR",
    "icon": "🔍",
    "imageUrl": null,
    "integrations": [
      "WordPress",
      "Google Search Console"
    ],
    "sellerPayoutsReady": true,
    "sellerName": "PluginCentral",
    "featured": false,
    "createdAt": "2026-09-17T08:00:00.000Z"
  },
  {
    "id": "demo-8",
    "slug": "social-media-scheduler",
    "title": "Social Media Scheduler",
    "summary": "Monthly social media management made easy",
    "description": "Monthly social media management made easy. Ships with setup notes and works with Instagram, Twitter, LinkedIn, Facebook.",
    "categorySlug": "subscriptions",
    "priceCents": 29900,
    "currency": "ZAR",
    "icon": "📱",
    "imageUrl": null,
    "integrations": [
      "Instagram",
      "Twitter",
      "LinkedIn",
      "Facebook"
    ],
    "sellerPayoutsReady": true,
    "sellerName": "SocialManager",
    "featured": false,
    "createdAt": "2026-09-16T08:00:00.000Z"
  },
  {
    "id": "demo-16",
    "slug": "enterprise-crm-with-ai",
    "title": "Enterprise CRM with AI",
    "summary": "Full CRM system with AI-powered insights",
    "description": "Full CRM system with AI-powered insights. Ships with setup notes and works with Salesforce, HubSpot, Custom CRM, Email, Calendar.",
    "categorySlug": "ai-automation",
    "priceCents": 1260000,
    "currency": "ZAR",
    "icon": "🤝",
    "imageUrl": null,
    "integrations": [
      "Salesforce",
      "HubSpot",
      "Custom CRM",
      "Email",
      "Calendar"
    ],
    "sellerPayoutsReady": true,
    "sellerName": "EnterpriseAI",
    "featured": false,
    "createdAt": "2026-09-15T08:00:00.000Z"
  },
  {
    "id": "demo-17",
    "slug": "custom-ai-solution-basic",
    "title": "Custom AI Solution (Basic)",
    "summary": "Custom-built AI solution for your business",
    "description": "Custom-built AI solution for your business. Ships with setup notes and works with Any Platform, Custom Integration, API.",
    "categorySlug": "ai-automation",
    "priceCents": 1440000,
    "currency": "ZAR",
    "icon": "⚙️",
    "imageUrl": null,
    "integrations": [
      "Any Platform",
      "Custom Integration",
      "API"
    ],
    "sellerPayoutsReady": true,
    "sellerName": "DHIVE",
    "featured": false,
    "createdAt": "2026-09-14T08:00:00.000Z"
  },
  {
    "id": "demo-18",
    "slug": "advanced-data-analytics",
    "title": "Advanced Data Analytics",
    "summary": "Complex data analysis and visualization",
    "description": "Complex data analysis and visualization. Ships with setup notes and works with PostgreSQL, MongoDB, BigQuery, Power BI, Tableau.",
    "categorySlug": "ai-automation",
    "priceCents": 1620000,
    "currency": "ZAR",
    "icon": "📊",
    "imageUrl": null,
    "integrations": [
      "PostgreSQL",
      "MongoDB",
      "BigQuery",
      "Power BI",
      "Tableau"
    ],
    "sellerPayoutsReady": true,
    "sellerName": "DataDriven",
    "featured": false,
    "createdAt": "2026-09-13T08:00:00.000Z"
  },
  {
    "id": "demo-19",
    "slug": "custom-ai-solution-advanced",
    "title": "Custom AI Solution (Advanced)",
    "summary": "Advanced custom-built AI system",
    "description": "Advanced custom-built AI system. Ships with setup notes and works with Any Platform, Custom Integration, API, Machine Learning.",
    "categorySlug": "ai-automation",
    "priceCents": 2340000,
    "currency": "ZAR",
    "icon": "🚀",
    "imageUrl": null,
    "integrations": [
      "Any Platform",
      "Custom Integration",
      "API",
      "Machine Learning"
    ],
    "sellerPayoutsReady": true,
    "sellerName": "DHIVE",
    "featured": false,
    "createdAt": "2026-09-12T08:00:00.000Z"
  },
  {
    "id": "demo-20",
    "slug": "enterprise-ai-suite",
    "title": "Enterprise AI Suite",
    "summary": "Complete enterprise automation solution",
    "description": "Complete enterprise automation solution. Ships with setup notes and works with All Platforms, Custom Integration, Multi-Team, API, Custom Reports.",
    "categorySlug": "ai-automation",
    "priceCents": 3600000,
    "currency": "ZAR",
    "icon": "🏢",
    "imageUrl": null,
    "integrations": [
      "All Platforms",
      "Custom Integration",
      "Multi-Team",
      "API",
      "Custom Reports"
    ],
    "sellerPayoutsReady": true,
    "sellerName": "EnterpriseAI",
    "featured": false,
    "createdAt": "2026-09-11T08:00:00.000Z"
  }
];
