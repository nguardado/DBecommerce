// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

struct Invoice {
    uint256 invoiceId;
    uint256 companyId;
    address customerAddress;
    uint256 totalAmount;
    uint256 timestamp;
    bool isPaid;
    bytes32 paymentTxHash;
}

library InvoiceLib {
    struct State {
        mapping(uint256 => Invoice) invoices;
        uint256 nextInvoiceId;
    }

    function createInvoice(State storage self, uint256 _companyId, address _customer, uint256 _totalAmount) internal returns (uint256) {
        uint256 id = self.nextInvoiceId++;
        self.invoices[id] = Invoice(id, _companyId, _customer, _totalAmount, block.timestamp, false, bytes32(0));
        return id;
    }

    function markPaid(State storage self, uint256 _invoiceId, bytes32 _txHash) internal {
        require(!self.invoices[_invoiceId].isPaid, "InvoiceLib: Invoice already paid");
        self.invoices[_invoiceId].isPaid = true;
        self.invoices[_invoiceId].paymentTxHash = _txHash;
    }

    function getInvoice(State storage self, uint256 _invoiceId) internal view returns (Invoice memory) {
        return self.invoices[_invoiceId];
    }

    function getInvoicesByCustomer(State storage self, address _customer) internal view returns (Invoice[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < self.nextInvoiceId; i++) {
            if (self.invoices[i].customerAddress == _customer) count++;
        }
        
        Invoice[] memory result = new Invoice[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < self.nextInvoiceId; i++) {
            if (self.invoices[i].customerAddress == _customer) {
                result[idx] = self.invoices[i];
                idx++;
            }
        }
        return result;
    }
}
