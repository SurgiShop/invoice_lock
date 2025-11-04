import frappe
from frappe import _
from invoice_lock.overdue import CUSTOM_LOCKED_FIELD


def validate_customer_not_locked(doc, method):
    """Prevent saving Sales Order or Quotation if customer is locked"""
    if not doc.customer:
        return
    
    customer_locked = frappe.db.get_value("Customer", doc.customer, CUSTOM_LOCKED_FIELD)
    
    if customer_locked:
        frappe.throw(
            _("Cannot save {0}. Customer {1} is locked due to overdue invoices.").format(
                doc.doctype, doc.customer
            ),
            title=_("Customer Locked")
        )


@frappe.whitelist()
def check_customer_lock_status(customer):
    """Server-side method to check if customer is locked (for client-side validation)"""
    if not customer:
        return {"locked": False}
    
    customer_locked = frappe.db.get_value("Customer", customer, CUSTOM_LOCKED_FIELD)
    return {"locked": bool(customer_locked)}

