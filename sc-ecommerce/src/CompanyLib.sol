// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

struct Company {
    uint256 companyId;
    string name;
    address companyAddress;  // Wallet donde recibe pagos
    string taxId;
    bool isActive;
}

library CompanyLib {
    struct State {
        mapping(uint256 => Company) companies;
        uint256 nextCompanyId;
    }

    function registerCompany(State storage self, string memory _name, address _companyAddress, string memory _taxId) internal returns (uint256) {
        uint256 id = self.nextCompanyId++;
        self.companies[id] = Company({
            companyId: id,
            name: _name,
            companyAddress: _companyAddress,
            taxId: _taxId,
            isActive: true
        });
        return id;
    }

    function getCompany(State storage self, uint256 _companyId) internal view returns (Company memory) {
        require(self.companies[_companyId].isActive, "CompanyLib: Inactive or non-existent company");
        return self.companies[_companyId];
    }
}
