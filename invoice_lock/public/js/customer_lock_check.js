// Function to check and warn about locked customer
function check_customer_lock_status(frm, doctype_name) {
  if (!frm.doc.customer) return;

  frappe.call({
    method: "frappe.client.get",
    args: {
      doctype: "Customer",
      name: frm.doc.customer
    },
    callback: function(r) {
      if (r.message && r.message.custom_account_locked) {
        frappe.msgprint({
          title: __("Customer Locked"),
          message: __("This customer is locked and cannot be used for {0}.", [doctype_name]),
          indicator: "red"
        });
      }
    }
  });
}

// Handler for Sales Order
frappe.ui.form.on('Sales Order', {
  customer: function(frm) {
    check_customer_lock_status(frm, "Sales Orders");
  },
  refresh: function(frm) {
    // Check on form load if customer is already set
    if (frm.doc.customer) {
      check_customer_lock_status(frm, "Sales Orders");
    }
  }
});

// Handler for Quotation
frappe.ui.form.on('Quotation', {
  customer: function(frm) {
    check_customer_lock_status(frm, "Quotations");
  },
  refresh: function(frm) {
    // Check on form load if customer is already set
    if (frm.doc.customer) {
      check_customer_lock_status(frm, "Quotations");
    }
  }
});
