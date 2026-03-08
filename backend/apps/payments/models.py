"""Payment, invoicing, arrears, and expense domain models."""

from decimal import Decimal

from django.core.validators import MinValueValidator
from django.db import models
from django.utils import timezone

from apps.core.models import TenantAwareModel


class Invoice(TenantAwareModel):
    class InvoiceStatus(models.TextChoices):
        DRAFT = "draft", "Draft"
        OPEN = "open", "Open"
        PARTIALLY_PAID = "partially_paid", "Partially Paid"
        PAID = "paid", "Paid"
        OVERDUE = "overdue", "Overdue"
        VOID = "void", "Void"

    lease = models.ForeignKey(
        "tenants_app.Lease",
        on_delete=models.PROTECT,
        related_name="invoices",
    )
    resident = models.ForeignKey(
        "tenants_app.Resident",
        on_delete=models.PROTECT,
        related_name="invoices",
    )
    property = models.ForeignKey(
        "properties.Property",
        on_delete=models.PROTECT,
        related_name="invoices",
    )
    unit = models.ForeignKey(
        "properties.Unit",
        on_delete=models.PROTECT,
        related_name="invoices",
    )
    invoice_number = models.CharField(max_length=50)
    billing_period_start = models.DateField()
    billing_period_end = models.DateField()
    due_date = models.DateField()
    subtotal_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    balance_due = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(
        max_length=20,
        choices=InvoiceStatus.choices,
        default=InvoiceStatus.OPEN,
    )
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-billing_period_start", "-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["tenant", "invoice_number"],
                name="unique_invoice_number_per_tenant",
            ),
        ]

    def __str__(self):
        return self.invoice_number

    def clean(self):
        if self.billing_period_end < self.billing_period_start:
            raise ValidationError("Billing period end must be after billing period start.")

    def save(self, *args, **kwargs):
        if self.lease_id:
            self.resident_id = self.lease.resident_id
            self.unit_id = self.lease.unit_id
            self.property_id = self.lease.unit.property_id
            self.tenant_id = self.lease.unit.tenant_id
        if self._state.adding and self.total_amount and not self.balance_due:
            self.balance_due = self.total_amount
        super().save(*args, **kwargs)


class Payment(TenantAwareModel):
    class PaymentMethod(models.TextChoices):
        CASH = "cash", "Cash"
        BANK_TRANSFER = "bank_transfer", "Bank Transfer"
        CARD = "card", "Card"
        MOBILE_MONEY = "mobile_money", "Mobile Money"
        CHEQUE = "cheque", "Cheque"
        OTHER = "other", "Other"

    class PaymentStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        PROCESSING = "processing", "Processing"
        SUCCEEDED = "succeeded", "Succeeded"
        FAILED = "failed", "Failed"
        REFUNDED = "refunded", "Refunded"
        CANCELLED = "cancelled", "Cancelled"

    lease = models.ForeignKey(
        "tenants_app.Lease",
        on_delete=models.PROTECT,
        related_name="payments",
    )
    resident = models.ForeignKey(
        "tenants_app.Resident",
        on_delete=models.PROTECT,
        related_name="payments",
    )
    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.SET_NULL,
        related_name="payments",
        null=True,
        blank=True,
    )
    property = models.ForeignKey(
        "properties.Property",
        on_delete=models.PROTECT,
        related_name="payments",
    )
    unit = models.ForeignKey(
        "properties.Unit",
        on_delete=models.PROTECT,
        related_name="payments",
    )
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    payment_date = models.DateField(default=timezone.localdate)
    method = models.CharField(
        max_length=20,
        choices=PaymentMethod.choices,
        default=PaymentMethod.BANK_TRANSFER,
    )
    status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING,
    )
    reference = models.CharField(max_length=120, blank=True)
    gateway_transaction_id = models.CharField(max_length=255, blank=True)
    received_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        related_name="recorded_payments",
        null=True,
        blank=True,
    )
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-payment_date", "-created_at"]
        indexes = [models.Index(fields=["tenant", "status", "payment_date"])]

    def __str__(self):
        return f"{self.reference or self.pk} - {self.amount}"

    def save(self, *args, **kwargs):
        if self.lease_id:
            self.resident_id = self.lease.resident_id
            self.unit_id = self.lease.unit_id
            self.property_id = self.lease.unit.property_id
            self.tenant_id = self.lease.unit.tenant_id
        super().save(*args, **kwargs)


class Arrear(TenantAwareModel):
    class ArrearStatus(models.TextChoices):
        OPEN = "open", "Open"
        IN_REVIEW = "in_review", "In Review"
        SETTLED = "settled", "Settled"
        WAIVED = "waived", "Waived"

    lease = models.ForeignKey(
        "tenants_app.Lease",
        on_delete=models.CASCADE,
        related_name="arrears",
    )
    resident = models.ForeignKey(
        "tenants_app.Resident",
        on_delete=models.CASCADE,
        related_name="arrears",
    )
    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.SET_NULL,
        related_name="arrears",
        null=True,
        blank=True,
    )
    amount_due = models.DecimalField(max_digits=12, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    outstanding_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(
        max_length=20,
        choices=ArrearStatus.choices,
        default=ArrearStatus.OPEN,
    )
    due_date = models.DateField()
    resolved_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-due_date"]

    def __str__(self):
        return f"Arrear {self.amount_due} for {self.resident}"

    def save(self, *args, **kwargs):
        if self.lease_id:
            self.tenant_id = self.lease.unit.tenant_id
            self.resident_id = self.lease.resident_id
        self.outstanding_amount = max(
            Decimal("0.00"),
            (self.amount_due or Decimal("0.00")) - (self.amount_paid or Decimal("0.00")),
        )
        if self.outstanding_amount == Decimal("0.00") and self.status == self.ArrearStatus.OPEN:
            self.status = self.ArrearStatus.SETTLED
        super().save(*args, **kwargs)


class Expense(TenantAwareModel):
    class ExpenseCategory(models.TextChoices):
        MAINTENANCE = "maintenance", "Maintenance"
        UTILITIES = "utilities", "Utilities"
        PAYROLL = "payroll", "Payroll"
        TAX = "tax", "Tax"
        INSURANCE = "insurance", "Insurance"
        CLEANING = "cleaning", "Cleaning"
        MARKETING = "marketing", "Marketing"
        OTHER = "other", "Other"

    class ExpenseStatus(models.TextChoices):
        DRAFT = "draft", "Draft"
        SUBMITTED = "submitted", "Submitted"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"
        PAID = "paid", "Paid"

    property = models.ForeignKey(
        "properties.Property",
        on_delete=models.PROTECT,
        related_name="expenses",
    )
    unit = models.ForeignKey(
        "properties.Unit",
        on_delete=models.SET_NULL,
        related_name="expenses",
        null=True,
        blank=True,
    )
    category = models.CharField(
        max_length=20,
        choices=ExpenseCategory.choices,
        default=ExpenseCategory.OTHER,
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    expense_date = models.DateField(default=timezone.localdate)
    vendor_name = models.CharField(max_length=255, blank=True)
    receipt = models.FileField(upload_to="expenses/receipts/", null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=ExpenseStatus.choices,
        default=ExpenseStatus.DRAFT,
    )
    submitted_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        related_name="submitted_expenses",
        null=True,
        blank=True,
    )
    approved_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        related_name="approved_expenses",
        null=True,
        blank=True,
    )
    approved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-expense_date", "-created_at"]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if self.property_id and self.property.tenant_id:
            self.tenant_id = self.property.tenant_id
        super().save(*args, **kwargs)
