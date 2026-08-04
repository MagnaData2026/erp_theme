"""
custom_ui/api/auth.py

Session-based auth. A browser that's already logged into ERPNext (normal
Frappe login, in this tab or another) does NOT need to call
custom_login at all -- frappe.session.user below is already resolved
automatically from the request's session cookie / API key by the time
any whitelisted method runs. custom_login is kept only for clients that
can't do a cookie-based login themselves (Postman, scripts, mobile).
"""

import frappe
from frappe import _


@frappe.whitelist(allow_guest=True)
def custom_login(usr: str, pwd: str):
    """Explicit username/password login, for non-browser clients only.
    A browser session with an existing valid ERPNext cookie should just
    call me() below directly instead of hitting this endpoint."""
    try:
        frappe.local.login_manager.authenticate(usr, pwd)
        frappe.local.login_manager.post_login()
    except frappe.exceptions.AuthenticationError:
        frappe.local.response["http_status_code"] = 401
        return {"success": False, "message": _("Invalid credentials")}

    frappe.local.response["http_status_code"] = 200
    return {
        "success": True,
        "user": frappe.session.user,
        "full_name": frappe.utils.get_fullname(frappe.session.user),
        "roles": frappe.get_roles(frappe.session.user),
    }


@frappe.whitelist()
def me():
    """The CURRENTLY logged-in user, resolved automatically from the
    request's session cookie/API key -- no credentials passed in the
    call. Call this on app load instead of prompting for a login; only
    prompt if authenticated comes back False."""
    user = frappe.session.user
    if user == "Guest":
        frappe.local.response["http_status_code"] = 401
        return {"authenticated": False}

    return {
        "authenticated": True,
        "user": user,
        "full_name": frappe.utils.get_fullname(user),
        "roles": frappe.get_roles(user),
    }


@frappe.whitelist()
def get_session_user_roles():
    """Every role assigned to the current session user. The frontend can
    use this to decide which buttons/menus to show; the server-side
    access_control.enforce_permission() is still the actual gate for the
    actions themselves, so hiding a button here is a UX nicety, not the
    security boundary."""
    return frappe.get_roles(frappe.session.user)


@frappe.whitelist()
def get_current_employee():
    """The Employee record linked to the current session user's login,
    if one exists -- for HR-facing views that need the logged-in
    person's own employee_id/department/etc."""
    user = frappe.session.user
    employee = frappe.db.get_value(
        "Employee",
        {"user_id": user},
        ["name", "employee_name", "department", "designation", "company"],
        as_dict=True,
    )
    if not employee:
        frappe.local.response["http_status_code"] = 404
        return {"found": False, "message": _("No Employee record linked to this user.")}
    return {"found": True, **employee}


@frappe.whitelist()
def logout():
    """Ends the current session -- included for completeness since
    custom_login above can start one explicitly for non-browser clients."""
    frappe.local.login_manager.logout()
    frappe.db.commit()
    return {"success": True}
