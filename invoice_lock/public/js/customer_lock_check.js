// Handler for Sales Order
frappe.ui.form.on('Sales Order', {
  refresh(frm) {
    // Trigger on form load if customer already set
    if (frm.doc.customer) {
      check_customer_lock(frm, true);
    }
  },
  customer(frm) {
    // Trigger when customer field changes
    if (frm.doc.customer) {
      check_customer_lock(frm, true);
    } else {
      // Clear lock status if customer is cleared
      frm.doc.customer_locked = false;
    }
  },
  validate(frm) {
    // Synchronous check before saving
    if (frm.doc.customer) {
      validate_customer_lock_sync(frm);
    }
  }
});

// Handler for Quotation
frappe.ui.form.on('Quotation', {
  refresh(frm) {
    // Trigger on form load if customer already set
    if (frm.doc.customer) {
      check_customer_lock(frm, true);
    }
  },
  customer(frm) {
    // Trigger when customer field changes
    if (frm.doc.customer) {
      check_customer_lock(frm, true);
    } else {
      // Clear lock status if customer is cleared
      frm.doc.customer_locked = false;
    }
  },
  validate(frm) {
    // Synchronous check before saving
    if (frm.doc.customer) {
      validate_customer_lock_sync(frm);
    }
  }
});

// Check customer lock status and show warning (async, for UX)
function check_customer_lock(frm, show_warning) {
  if (!frm.doc.customer) return;

  frappe.call({
    method: "frappe.client.get",
    args: {
      doctype: "Customer",
      name: frm.doc.customer
    },
    callback: function(r) {
      if (r.message && r.message.custom_account_locked) {
        // Set flag to prevent saving
        frm.doc.customer_locked = true;
        
        if (show_warning) {
          frappe.msgprint({
            title: __("Customer Locked"),
            message: __("This customer is locked and cannot be used for Sales Orders or Quotations."),
            indicator: "red"
          });
        }
        
        // Clear the customer field
        frm.set_value('customer', '');
      } else {
        frm.doc.customer_locked = false;
      }
    }
  });
}

// Synchronous validation check before saving
// Note: Server-side validation hook will catch this if client-side check fails
function validate_customer_lock_sync(frm) {
  if (!frm.doc.customer) return;

  // Check if flag was set by async check (for quick feedback)
  if (frm.doc.customer_locked) {
    frappe.throw(
      __("Cannot save {0}. Customer {1} is locked due to overdue invoices.").format(
        frm.doctype,
        frm.doc.customer
      ),
      __("Customer Locked")
    );
  }
  
  // Server-side validation hook will catch this if the flag wasn't set
  // This provides immediate client-side feedback
}
