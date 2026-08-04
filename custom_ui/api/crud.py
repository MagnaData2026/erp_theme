"""
custom_ui/api/crud.py

Generic doc CRUD over a single endpoint (execute_doc_action), matching
ERP_AI.postman_collection.json's "crud" folder. Every action is gated by
access_control.enforce_permission() against the CURRENT SESSION USER's
roles before anything runs -- no doctype/action combination bypasses it,
including get_list, so a user without Read on a doctype can't even
enumerate its records.
"""

import json

import frappe
from frappe import _

from custom_ui.api.access_control import enforce_permission

_VALID_ACTIONS = {"get_list", "get", "create", "update", "delete"}


@frappe.whitelist()
def execute_doc_action(action: str, doctype: str, **kwargs):
    if action not in _VALID_ACTIONS:
        frappe.throw(_("Unknown action: {0}").format(action), frappe.ValidationError)

    # Role-based gate -- raises frappe.PermissionError (HTTP 403) and
    # handles the 3-strikes admin alert internally if this user's roles
    # don't grant `action` on `doctype` per Role Permissions Manager.
    enforce_permission(doctype, action)

    if action == "get_list":
        return _get_list(doctype, kwargs)
    if action == "get":
        return _get(doctype, kwargs)
    if action == "create":
        return _create(doctype, kwargs)
    if action == "update":
        return _update(doctype, kwargs)
    if action == "delete":
        return _delete(doctype, kwargs)


def _parse_json_arg(value):
    """Callers may send filters/fields/data either as an already-parsed
    dict/list or as a JSON string depending on the client -- accept
    both instead of erroring on one of them."""
    if isinstance(value, str):
        try:
            return json.loads(value)
        except (TypeError, ValueError):
            return value
    return value


def _get_list(doctype, kwargs):
    filters = _parse_json_arg(kwargs.get("filters")) or {}
    fields = _parse_json_arg(kwargs.get("fields")) or ["name"]
    limit = int(kwargs.get("limit") or 20)
    order_by = kwargs.get("order_by")

    # frappe.get_list (not get_all) additionally applies this user's
    # row-level permission rules (e.g. territory/user-permission
    # restrictions configured on the DocType), on top of the doctype-
    # level Read check enforce_permission() already did above.
    return frappe.get_list(
        doctype,
        filters=filters,
        fields=fields,
        limit_page_length=limit,
        order_by=order_by,
    )


def _get(doctype, kwargs):
    name = kwargs.get("name")
    if not name:
        frappe.throw(_("'name' is required for action 'get'."), frappe.ValidationError)
    doc = frappe.get_doc(doctype, name)
    doc.check_permission("read")
    return doc.as_dict()


def _create(doctype, kwargs):
    data = _parse_json_arg(kwargs.get("data")) or {}
    doc = frappe.new_doc(doctype)
    doc.update(data)
    doc.insert()
    frappe.db.commit()
    return doc.as_dict()


def _update(doctype, kwargs):
    name = kwargs.get("name")
    data = _parse_json_arg(kwargs.get("data")) or {}
    if not name:
        frappe.throw(_("'name' is required for action 'update'."), frappe.ValidationError)
    doc = frappe.get_doc(doctype, name)
    doc.update(data)
    doc.save()
    frappe.db.commit()
    return doc.as_dict()


def _delete(doctype, kwargs):
    name = kwargs.get("name")
    if not name:
        frappe.throw(_("'name' is required for action 'delete'."), frappe.ValidationError)
    frappe.delete_doc(doctype, name, ignore_permissions=False)
    frappe.db.commit()
    return {"success": True, "deleted": name}
