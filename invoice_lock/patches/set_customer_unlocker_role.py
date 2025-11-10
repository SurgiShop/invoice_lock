import frappe

def execute():
    user = "gary.starr@surgishop.com"
    role = "Customer Unlocker"

    try:
        if not frappe.db.exists("Role", role):
            frappe.logger().warning(f"Role '{role}' not found. Skipping assignment.")
            return

        current_roles = frappe.get_roles(user)
        if role not in current_roles:
            frappe.set_user_roles(user, current_roles + [role])
            frappe.db.commit()
            frappe.logger().info(f"Assigned '{role}' to {user}")
        else:
            frappe.logger().info(f"'{role}' already assigned to {user}")
    except Exception as e:
        frappe.logger().error(f"Failed to assign '{role}' to {user}: {e}")
