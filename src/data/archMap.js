export const architectureMap = [
  {
    file_path: "payment/processor.js",
    depends_on: ["payment/gateway.js", "auth/validator.js", "db/queries.js"],
    pci_compliance_risk: "HIGH",
    description: "Core payment processing logic. Handles charge, refund, and retry flows. Any changes here require PCI review.",
    business_criticality: "CRITICAL"
  },
  {
    file_path: "payment/gateway.js",
    depends_on: ["config/secrets.js"],
    pci_compliance_risk: "HIGH",
    description: "Payment gateway integration layer. Handles communication with Stripe/PayPal APIs.",
    business_criticality: "CRITICAL"
  },
  {
    file_path: "api/routes/users.js",
    depends_on: ["db/queries.js", "middleware/auth.js", "middleware/logger.js"],
    pci_compliance_risk: "LOW",
    description: "User CRUD endpoints. Handles profile management and user search.",
    business_criticality: "HIGH"
  },
  {
    file_path: "middleware/auth.js",
    depends_on: ["auth/refresh.js", "config/secrets.js"],
    pci_compliance_risk: "MEDIUM",
    description: "JWT authentication middleware. Validates tokens and handles refresh flow.",
    business_criticality: "CRITICAL"
  },
  {
    file_path: "middleware/logger.js",
    depends_on: ["config/logging.js"],
    pci_compliance_risk: "HIGH",
    description: "Request/response logging middleware. Must sanitize sensitive data before logging.",
    business_criticality: "MEDIUM"
  },
  {
    file_path: "orders/processor.js",
    depends_on: ["orders/charge.js", "payment/processor.js", "db/queries.js"],
    pci_compliance_risk: "HIGH",
    description: "Order processing pipeline. Orchestrates payment, inventory, and notification flows.",
    business_criticality: "CRITICAL"
  },
  {
    file_path: "realtime/wsHandler.js",
    depends_on: ["realtime/connections.js", "middleware/auth.js"],
    pci_compliance_risk: "LOW",
    description: "WebSocket connection handler. Manages real-time bidirectional communication.",
    business_criticality: "HIGH"
  },
  {
    file_path: "db/queries.js",
    depends_on: ["config/database.js"],
    pci_compliance_risk: "MEDIUM",
    description: "Database query layer. All SQL queries must use parameterized statements.",
    business_criticality: "CRITICAL"
  }
];
