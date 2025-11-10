frappe.ui.form.on('Customer', {
    refresh: function(frm) {
        if (frm.doc.custom_account_locked && frm.doc.custom_locked_status) {
            frm.fields_dict.custom_locked_status.$wrapper.html(frm.doc.custom_locked_status);
        }
    }
});
