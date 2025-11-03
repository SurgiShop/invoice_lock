import frappe
from frappe.utils import getdate, now_date, add_days

CUSTOM_LOCKED_FIELD = "custom_account_locked"

def check_overdue_invoices_and_lock_customers():
    today = getdate(now_date())
    date_80_days_ago = add_days(today, -80)
    date_90_days_ago = add_days(today, -90)

    overdue_invoices = frappe.get_list(
        "Sales Invoice",
        filters={
            "docstatus": 1,
            "outstanding_amount": (">", 0),
            "due_date": ("<", date_80_days_ago)
        },
        fields=["name", "customer", "due_date", "outstanding_amount", "customer_name", "company"]
    )

    for inv in overdue_invoices:
        days_overdue = (today - getdate(inv.due_date)).days

        if days_overdue >= 90:
            lock_customer(inv, today, days_overdue)
        elif days_overdue >= 80:
            notify_account_manager(inv, days_overdue)

    frappe.db.commit()

def lock_customer(invoice_doc, today, days_overdue):
    customer_doc = frappe.get_doc("Customer", invoice_doc.customer)

    if not customer_doc.get(CUSTOM_LOCKED_FIELD):
        customer_doc.set(CUSTOM_LOCKED_FIELD, 1)
        customer_doc.save(ignore_permissions=True)

        email = frappe.db.get_value("User", customer_doc.account_manager, "email")
        if email:
            frappe.sendmail(
                recipients=[email],
                subject=f"Customer {customer_doc.name} locked due to overdue invoice",
                message=f"""
                    <p>Customer <strong>{customer_doc.name}</strong> has been locked because invoice
                    <strong>{invoice_doc.name}</strong> is <strong>{days_overdue} days overdue</strong>
                    (Due: {invoice_doc.due_date}).</p>
                    <p>Lock set on {today}. Manual unlock required.</p>
                """
            )

def notify_account_manager(invoice_doc, days_overdue):
    user_id = frappe.db.get_value("Customer", invoice_doc.customer, "account_manager")
    email = frappe.db.get_value("User", user_id, "email") if user_id else None

    if email:
        currency = frappe.db.get_value("Company", invoice_doc.company, "default_currency")
        frappe.sendmail(
            recipients=[email],
            subject=f"Invoice {invoice_doc.name} is {days_overdue} days overdue",
            message=f"""
                <p>Invoice <strong>{invoice_doc.name}</strong> for customer
                <strong>{invoice_doc.customer_name}</strong> is now
                <strong>{days_overdue} days overdue</strong> (Due: {invoice_doc.due_date}).</p>
                <p>Outstanding Amount: {invoice_doc.outstanding_amount} {currency}</p>
                <p><strong>Action Required:</strong> Please follow up. Customer will be locked at 90 days overdue.</p>
            """
        )
