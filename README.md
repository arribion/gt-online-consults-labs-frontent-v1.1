```erd
                   Users
                     │
      ┌──────────────┼───────────────┐
      │              │               │
      │              │               │
 Projects      Notifications    AuditLogs
      │
      │
      ▼
ProjectAssignments
      ▲
      │
      │
    Users(Taskers)

Projects
    │
    ├──────────────► Resources
    │                     │
    │                     ▼
    │         ResourceAcknowledgements
    │
    ├──────────────► PayPeriods
    │                     │
    │                     ▼
    │              PaymentLedgers
    │                     │
    │                     ▼
    │                Invoices
    │
    ▼
TaskSubmissions
      │
      ▼
TaskEntries
```

Based on your system specification, I would recommend **MongoDB with normalized collections**, rather than embedding everything into one document. Although the specification recommends PostgreSQL because of financial transactions, MongoDB is still a good fit if you carefully model the relationships and use transactions for payment operations. The core entities and relationships are described in the specification's data model. 

# MongoDB Database Structure

```
gt-tasker-db
│
├── users
├── projects
├── projectAssignments
├── resources
├── resourceAcknowledgements
├── taskSubmissions
├── taskEntries
├── payPeriods
├── paymentLedgers
├── invoices
├── notifications
├── auditLogs
├── invitations
└── settings
```

---

# 1. Users Collection

```javascript
{
    _id: ObjectId,

    fullName: String,

    email: String,

    password: String,

    role: "SUPER_ADMIN" | "ADMIN" | "TASKER",

    status: "ACTIVE" | "INACTIVE" | "SUSPENDED",

    phone: String,

    avatar: String,

    payoutMethod: {
        type: "BANK" | "MPESA" | "PAYPAL",
        accountName: String,
        accountNumber: String
    },

    invitedBy: ObjectId,

    emailVerified: Boolean,

    lastLogin: Date,

    createdAt: Date,

    updatedAt: Date
}
```

---

# 2. Projects Collection

```javascript
{
    _id: ObjectId,

    name: String,

    description: String,

    platform: String,

    category: String,

    status: "DRAFT" | "ACTIVE" | "PAUSED" | "CLOSED",

    rate: {
        type: "PER_TASK" | "PER_HOUR" | "PER_BATCH",
        value: Number,
        currency: "USD"
    },

    revenueSplit: {
        tasker: Number,
        admin: Number,
        owner: Number
    },

    createdBy: ObjectId,

    createdAt: Date,

    updatedAt: Date
}
```

---

# 3. Project Assignments (Many-to-Many)

One project has many taskers.

One tasker can work on many projects.

```
Users
   ▲
   │
   │
ProjectAssignments
   │
   ▼
Projects
```

```javascript
{
    _id: ObjectId,

    projectId: ObjectId,

    taskerId: ObjectId,

    customRate: Number,

    assignedBy: ObjectId,

    assignedAt: Date,

    removedAt: Date
}
```

---

# 4. Resources

```javascript
{
    _id: ObjectId,

    projectId: ObjectId,

    title: String,

    description: String,

    type: "PDF" | "VIDEO" | "IMAGE" | "LINK",

    fileUrl: String,

    version: Number,

    requiresAcknowledgement: Boolean,

    uploadedBy: ObjectId,

    createdAt: Date
}
```

---

# 5. Resource Acknowledgements

```
User
 ▲
 │
 │
ResourceAcknowledgements
 │
 ▼
Resource
```

```javascript
{
    _id: ObjectId,

    resourceId: ObjectId,

    taskerId: ObjectId,

    acknowledgedAt: Date
}
```

---

# 6. Task Submissions

Every uploaded Excel file creates ONE submission.

```
Tasker
   │
   ▼
TaskSubmission
```

```javascript
{
    _id: ObjectId,

    projectId: ObjectId,

    taskerId: ObjectId,

    payPeriodId: ObjectId,

    excelFile: String,

    totalRows: Number,

    status:
        "PENDING"
        | "APPROVED"
        | "REJECTED"
        | "NEEDS_CORRECTION",

    reviewedBy: ObjectId,

    submittedAt: Date,

    reviewedAt: Date
}
```

---

# 7. Task Entries

Every row inside Excel becomes a TaskEntry.

```
Submission
      │
      ▼
TaskEntries
```

```javascript
{
    _id: ObjectId,

    submissionId: ObjectId,

    taskId: String,

    workDate: Date,

    quantity: Number,

    notes: String,

    amount: Number,

    flagReason: String
}
```

---

# 8. Pay Periods

```javascript
{
    _id: ObjectId,

    projectId: ObjectId,

    startDate: Date,

    endDate: Date,

    status:
        "OPEN"
        | "RECONCILING"
        | "CLOSED",

    createdBy: ObjectId
}
```

---

# 9. Payment Ledger

This should never be edited manually.

```javascript
{
    _id: ObjectId,

    projectId: ObjectId,

    taskerId: ObjectId,

    payPeriodId: ObjectId,

    submissionId: ObjectId,

    totalTasks: Number,

    totalAmount: Number,

    status:
        "PENDING"
        | "PAID",

    calculatedAt: Date
}
```

---

# 10. Invoices

```javascript
{
    _id: ObjectId,

    invoiceNumber: String,

    taskerId: ObjectId,

    payPeriodId: ObjectId,

    items: [
        {
            projectId: ObjectId,

            quantity: Number,

            rate: Number,

            subtotal: Number
        }
    ],

    subtotal: Number,

    adjustments: Number,

    total: Number,

    status:
        "DRAFT"
        | "ISSUED"
        | "PAID"
        | "OVERDUE",

    pdfUrl: String,

    issuedAt: Date,

    paidAt: Date
}
```

---

# 11. Notifications

```javascript
{
    _id: ObjectId,

    userId: ObjectId,

    title: String,

    message: String,

    type:
        "PAYMENT"
        | "PROJECT"
        | "RESOURCE"
        | "INVOICE"
        | "SYSTEM",

    read: Boolean,

    createdAt: Date
}
```

---

# 12. Audit Logs

```javascript
{
    _id: ObjectId,

    actor: ObjectId,

    action: String,

    entity: String,

    entityId: ObjectId,

    before: Object,

    after: Object,

    createdAt: Date
}
```

---

# 13. Invitations

```javascript
{
    _id: ObjectId,

    email: String,

    role: "ADMIN" | "TASKER",

    token: String,

    expiresAt: Date,

    accepted: Boolean,

    invitedBy: ObjectId,

    createdAt: Date
}
```

---

# 14. Settings

```javascript
{
    _id: ObjectId,

    companyName: String,

    defaultCurrency: "USD",

    invoicePrefix: "GT",

    taxRate: Number,

    createdAt: Date
}
```

# Entity Relationship Diagram (ERD)

```text
                   Users
                     │
      ┌──────────────┼───────────────┐
      │              │               │
      │              │               │
 Projects      Notifications    AuditLogs
      │
      │
      ▼
ProjectAssignments
      ▲
      │
      │
    Users(Taskers)

Projects
    │
    ├──────────────► Resources
    │                     │
    │                     ▼
    │         ResourceAcknowledgements
    │
    ├──────────────► PayPeriods
    │                     │
    │                     ▼
    │              PaymentLedgers
    │                     │
    │                     ▼
    │                Invoices
    │
    ▼
TaskSubmissions
      │
      ▼
TaskEntries
```

# Collection Relationships

| Parent         | Child                   | Relationship                                          |
| -------------- | ----------------------- | ----------------------------------------------------- |
| User           | ProjectAssignment       | 1:N                                                   |
| Project        | ProjectAssignment       | 1:N                                                   |
| Project        | Resources               | 1:N                                                   |
| Resource       | ResourceAcknowledgement | 1:N                                                   |
| User           | ResourceAcknowledgement | 1:N                                                   |
| User           | TaskSubmission          | 1:N                                                   |
| Project        | TaskSubmission          | 1:N                                                   |
| TaskSubmission | TaskEntry               | 1:N                                                   |
| Project        | PayPeriod               | 1:N                                                   |
| PayPeriod      | PaymentLedger           | 1:N                                                   |
| User           | PaymentLedger           | 1:N                                                   |
| PaymentLedger  | Invoice                 | 1:1 (typically one invoice per tasker per pay period) |
| User           | Notification            | 1:N                                                   |
| User           | AuditLog                | 1:N                                                   |

This schema follows the functional requirements in your platform specification while adapting them to MongoDB's document model. It keeps high-growth collections (task entries, submissions, ledgers, audit logs) separate for scalability and supports efficient indexing on fields like `projectId`, `taskerId`, `payPeriodId`, and `status` for dashboard queries and reporting.

