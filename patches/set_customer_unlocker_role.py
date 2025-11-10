import frappe

def execute():
    user = "gary.starr@surgishop.com"
    roles = frappe.get_roles(user)
    if "Customer Unlocker" not in roles:
        frappe.set_user_roles(user, roles + ["Customer Unlocker"])
        frappe.db.commit()
        frappe.logger().info(f"Assigned 'Customer Unlocker' to {user}")
