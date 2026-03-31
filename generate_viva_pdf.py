from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak

OUTPUT_FILE = "Viva_Preparation_AutoAssist.pdf"


def page_title(text):
    return Paragraph(text, styles["PageTitle"])


def h2(text):
    return Paragraph(text, styles["Heading2Custom"])


def body(text):
    return Paragraph(text, styles["BodyCustom"])


def bullet(text):
    return Paragraph(f"• {text}", styles["BulletCustom"])


styles = getSampleStyleSheet()
styles.add(
    ParagraphStyle(
        name="PageTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#0F172A"),
        spaceAfter=10,
    )
)
styles.add(
    ParagraphStyle(
        name="Heading2Custom",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=16,
        textColor=colors.HexColor("#1E293B"),
        spaceAfter=6,
        spaceBefore=6,
    )
)
styles.add(
    ParagraphStyle(
        name="BodyCustom",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor("#0F172A"),
        spaceAfter=4,
    )
)
styles.add(
    ParagraphStyle(
        name="BulletCustom",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=10.5,
        leading=14,
        leftIndent=10,
        textColor=colors.HexColor("#0F172A"),
        spaceAfter=2,
    )
)


def add_page(story, title, summary, key_points, viva_questions):
    story.append(page_title(title))
    story.append(body(summary))
    story.append(Spacer(1, 0.2 * cm))

    story.append(h2("What To Explain"))
    for item in key_points:
        story.append(bullet(item))

    story.append(Spacer(1, 0.2 * cm))
    story.append(h2("Likely Viva Questions"))
    for q, a in viva_questions:
        story.append(body(f"Q: {q}"))
        story.append(body(f"A: {a}"))

    story.append(PageBreak())


def build_pdf():
    doc = SimpleDocTemplate(
        OUTPUT_FILE,
        pagesize=A4,
        rightMargin=1.8 * cm,
        leftMargin=1.8 * cm,
        topMargin=1.6 * cm,
        bottomMargin=1.6 * cm,
        title="Auto Assist Viva Preparation",
        author="Suraj Khadka",
    )

    story = []

    add_page(
        story,
        "Page 1: Project Overview And Architecture",
        "Auto Assist is a full-stack garage management system. It supports three roles (admin, mechanic, customer), vehicle service booking, live chat, invoicing, inventory, rating, and Khalti payment integration.",
        [
            "Frontend uses React with role-based route layouts for admin, mechanic, and customer.",
            "Backend uses Express and Prisma ORM with MySQL as datasource.",
            "JWT authentication secures APIs. Bcrypt hashes passwords.",
            "Socket.IO powers realtime chat and notification events.",
            "Email notifications are sent for booking confirmation, updates, payment, and reminders.",
        ],
        [
            (
                "Why did you choose a layered architecture?",
                "It separates concerns: routes for API definition, controllers for business logic, Prisma for data access, making the code easier to maintain and test.",
            ),
            (
                "What is the main benefit of Prisma in this project?",
                "Prisma gives clear relation mapping, migration support, and safer queries with less boilerplate.",
            ),
        ],
    )

    add_page(
        story,
        "Page 2: Backend Entry And Route Design",
        "The backend entry initializes Express, CORS, JSON parsing, Socket.IO server, reminder job, and all API routes.",
        [
            "HTTP server wraps Express to enable Socket.IO on same port.",
            "Route modules are grouped by feature: auth, bookings, inventory, invoice, payment, messages, ratings, settings.",
            "Health endpoint returns backend status for quick checks.",
            "Reminder job starts at server boot and runs every 24 hours.",
        ],
        [
            (
                "Why use route modules instead of one big file?",
                "Feature-based route modules improve readability and reduce merge conflicts.",
            ),
            (
                "Why bind Socket.IO to the same HTTP server?",
                "It simplifies deployment and keeps API and realtime events under one backend origin.",
            ),
        ],
    )

    add_page(
        story,
        "Page 3: Database Schema (Prisma Models)",
        "The schema models garage operations around appointment lifecycle, users, vehicles, parts, and billing.",
        [
            "User model stores role, profile, and mechanic-specific fields.",
            "Appointment links customer, vehicle, mechanic, parts, updates, invoice, and rating.",
            "Part and PartLog enable inventory stock and audit trail.",
            "Invoice is one-to-one with appointment for clear billing ownership.",
            "PendingPartPayment protects payment verification and stock update flow.",
        ],
        [
            (
                "Why is invoice one-to-one with appointment?",
                "Each service appointment should have a single canonical billing document.",
            ),
            (
                "How does schema support analytics?",
                "Amount, status, timestamps, part logs, and rating fields provide dimensions for monthly and yearly stats.",
            ),
        ],
    )

    add_page(
        story,
        "Page 4: Authentication And Authorization",
        "Auth module handles registration, login, role assignment, and guarded route access.",
        [
            "Register validates input, checks duplicate email, hashes password, and creates user.",
            "First registered user becomes ADMIN for bootstrap access.",
            "Login verifies bcrypt hash and signs JWT with user id and role.",
            "Protect middleware reads Bearer token and loads authenticated user.",
            "Admin middleware blocks non-admin access to privileged endpoints.",
        ],
        [
            (
                "Why include role in JWT payload?",
                "Role is needed for fast authorization checks without extra decoding complexity.",
            ),
            (
                "How do you avoid storing plain passwords?",
                "Passwords are hashed using bcrypt with salt before insertion.",
            ),
        ],
    )

    add_page(
        story,
        "Page 5: Booking Lifecycle",
        "Booking logic handles creation, listing by role, updates, auto-mechanic assignment, and delete.",
        [
            "Customer creates booking with service, time, and vehicle id.",
            "System assigns least-loaded mechanic by active appointment count.",
            "Status/stage/progress updates are controlled by role ownership checks.",
            "When completed, service-finalized notifications are sent by email and socket.",
            "Revenue endpoint aggregates monthly/yearly totals and mechanic performance.",
        ],
        [
            (
                "How is mechanic assignment done automatically?",
                "Mechanics are sorted by current pending/in-progress workload and the least busy mechanic is selected.",
            ),
            (
                "How do you prevent unauthorized booking edits?",
                "Controller verifies user role and compares appointment owner/mechanic id with authenticated user id.",
            ),
        ],
    )

    add_page(
        story,
        "Page 6: Job Parts And Job Updates",
        "Job parts and updates support service transparency and inventory synchronization.",
        [
            "Adding a part to job checks stock and creates/updates JobPart record.",
            "Part stock is decremented and audit log is inserted.",
            "Removing job part restores stock and logs reverse movement.",
            "Job updates provide progress notes tied to appointment.",
        ],
        [
            (
                "Why store priceAtTime in JobPart?",
                "It preserves historical pricing even if catalog price changes later.",
            ),
            (
                "Why keep part logs?",
                "Part logs provide traceability for every stock movement and simplify audits.",
            ),
        ],
    )

    add_page(
        story,
        "Page 7: Inventory Management",
        "Inventory module supports part CRUD, stock operations, restock requests, purchase flow, and sales revenue.",
        [
            "Part status automatically switches among OK, Low, and Critical using thresholds.",
            "Stock updates are logged with type and note for accountability.",
            "Restock request creates audit entry without direct stock mutation.",
            "Direct customer parts purchase updates stock in transaction and returns bill summary.",
            "Revenue from direct sales is computed from stock-out logs.",
        ],
        [
            (
                "How is low stock detected?",
                "Current stock is compared with minStock and a critical floor threshold.",
            ),
            (
                "Why use transaction in purchase flow?",
                "It ensures all stock updates succeed together or fail together, preventing partial state.",
            ),
        ],
    )

    add_page(
        story,
        "Page 8: Invoicing",
        "Invoice logic calculates labor plus parts, applies loyalty discount and tax from settings, and persists totals.",
        [
            "Invoice is upserted per appointment to avoid duplicates.",
            "Parts total comes from consumed job parts and their stored priceAtTime.",
            "Discount and tax rates are centrally controlled in settings.",
            "Appointment amount is synchronized to invoice total for reporting consistency.",
            "Invoice fetch returns customer and vehicle details for presentation.",
        ],
        [
            (
                "How do you keep invoice consistent if called multiple times?",
                "Upsert updates existing invoice by appointment id instead of creating a second record.",
            ),
            (
                "Where is tax/discount policy controlled?",
                "In settings table, so admin can change policy without code edits.",
            ),
        ],
    )

    add_page(
        story,
        "Page 9: Payment Integration (Khalti)",
        "Payment module initiates and verifies online payments for appointments and parts purchases.",
        [
            "Initiation endpoint constructs Khalti payload and returns pidx/payment_url.",
            "Service mode marks appointment paid after successful verification.",
            "Parts mode uses PendingPartPayment state machine to prevent duplicate processing.",
            "Amount mismatch checks and status locks protect against inconsistent verification.",
            "Email and socket notifications are sent after successful payment.",
        ],
        [
            (
                "How do you avoid double stock deduction in parts payment?",
                "By moving payment records from PENDING to PROCESSING to COMPLETED and processing deduction only once.",
            ),
            (
                "Why verify payment server-side?",
                "Server-side verification is trusted and protects against client-side tampering.",
            ),
        ],
    )

    add_page(
        story,
        "Page 10: Realtime Chat And Support",
        "Realtime communication is implemented with Socket.IO and message persistence in database.",
        [
            "Users join role/user/appointment rooms for scoped event delivery.",
            "Messages are stored in DB and emitted to target room.",
            "Unread counts and read-marking improve chat UX.",
            "Payment support flow has controlled support window and status markers.",
            "Direct customer-to-admin chat restriction enforces policy except payment support channel.",
        ],
        [
            (
                "Why persist chat messages if sockets are realtime?",
                "Persistence enables history, unread counts, and offline retrieval.",
            ),
            (
                "How is payment support different from normal chat?",
                "It uses metadata marker messages and a time-bound support session workflow.",
            ),
        ],
    )

    add_page(
        story,
        "Page 11: Email Notifications And Reminder Job",
        "Email utility centralizes transaction and status communication for users and mechanics.",
        [
            "Templates include booking confirmation, updates, reminders, assignment, payment receipt, and finalization.",
            "Reminder job runs on startup and every 24 hours.",
            "It parses booking time safely and targets next-day appointments.",
            "Mail credentials are loaded from environment variables.",
        ],
        [
            (
                "Why run reminder as scheduled backend job?",
                "It automates customer communication without manual admin effort.",
            ),
            (
                "How do you handle invalid booking time formats?",
                "Parser attempts direct and normalized date conversions and skips invalid entries.",
            ),
        ],
    )

    add_page(
        story,
        "Page 12: Frontend App Structure And Routing",
        "Frontend routing is role-centric, mapping each user type to dedicated layouts and pages.",
        [
            "Public pages include landing and marketing sections.",
            "Auth pages handle registration and login.",
            "Admin, customer, and mechanic areas use nested routes.",
            "Payment success route supports post-Khalti redirect handling.",
            "Provider composition wraps app with auth and socket contexts.",
        ],
        [
            (
                "Why use nested routes for role dashboards?",
                "Nested routing reuses shared layout and keeps role pages organized.",
            ),
            (
                "How do you navigate user by role after login?",
                "Frontend checks role from login response and redirects to matching route root.",
            ),
        ],
    )

    add_page(
        story,
        "Page 13: Frontend State, API, And Context",
        "Auth and socket contexts provide app-wide user and realtime capabilities.",
        [
            "Axios instance has centralized base URL and auth token interceptor.",
            "AuthContext stores user session and provides login/register/logout methods.",
            "SocketContext creates socket connection after login and joins user/admin rooms.",
            "Token and user object are persisted in localStorage for session continuity.",
        ],
        [
            (
                "Why use Axios interceptor for JWT?",
                "It automatically injects token into every API request and avoids duplicate code.",
            ),
            (
                "When is socket initialized?",
                "After authenticated user is available in context.",
            ),
        ],
    )

    add_page(
        story,
        "Page 14: Viva Defense, Improvements, And Risks",
        "This page helps you answer critical-thinking questions about quality, risk, and future work.",
        [
            "Current strengths: role-based flow, normalized schema, realtime updates, audit logs, payment verification.",
            "Risk to mention: open CORS should be restricted in production.",
            "Risk to mention: fallback JWT secret should be removed in deployment.",
            "Improvement: add automated tests for auth, booking status transitions, payment verification paths.",
            "Improvement: use stricter request validation library and centralized error middleware.",
            "Improvement: containerized deployment and CI checks for migrations.",
        ],
        [
            (
                "If you had one week more, what would you add?",
                "Automated test suite, stricter API validation, and production security hardening for env/cors/token handling.",
            ),
            (
                "How would you scale this architecture?",
                "Introduce caching, separate worker for background jobs, and move realtime and API behind managed deployment with monitoring.",
            ),
        ],
    )

    # Remove final page break if present
    if story and isinstance(story[-1], PageBreak):
        story.pop()

    doc.build(story)


if __name__ == "__main__":
    build_pdf()
    print(f"Created {OUTPUT_FILE}")
