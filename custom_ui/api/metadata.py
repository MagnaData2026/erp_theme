"""
custom_ui/api/metadata.py

DocType field metadata, gated the same way as crud.py -- a user can't
discover the field-level structure of a doctype they have no Read
access to.
"""

import frappe

from custom_ui.api.access_control import enforce_permission


@frappe.whitelist()
def get_complete_doctype_metadata(doctype: str):
    enforce_permission(doctype, "get_list")  # "read"-equivalent gate

    meta = frappe.get_meta(doctype)
    return {
        "doctype": doctype,
        "fields": [
            {
                "fieldname": f.fieldname,
                "label": f.label,
                "fieldtype": f.fieldtype,
                "reqd": f.reqd,
                "options": f.options,
                "read_only": f.read_only,
            }
            for f in meta.fields
        ],
        "permissions": meta.permissions,
        "roles": frappe.get_roles(frappe.session.user),
    }
