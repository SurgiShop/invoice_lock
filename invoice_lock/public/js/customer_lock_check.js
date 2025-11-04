frappe.ui.form.on(['Sales Order', 'Quotation'], {
  refresh(frm) {
    // Trigger on form load if customer already set
    if (frm.doc.customer) {
      check_customer_lock(frm);
    }
  },
  customer(frm) {
    // Trigger when customer field is selected or changed
    if (frm.doc.customer) {
      check_customer_lock(frm);
    }
  }
});

function check_customer_lock(frm) {
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
          message: __("This customer is locked and cannot be used for Sales Orders or Quotations."),
          indicator: "red"
        });
        frm.set_value('customer', '');
      }
    }
  });
}
