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

    function getCompanyCount(State storage self) internal view returns (uint256) {
        return self.nextCompanyId;
    }

    function getAllCompanies(State storage self) internal view returns (Company[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < self.nextCompanyId; i++) {
            if (self.companies[i].isActive) activeCount++;
        }
        
        Company[] memory activeCompanies = new Company[](activeCount);
        uint256 idx = 0;
        
        for (uint256 i = 0; i < self.nextCompanyId; i++) {
            if (self.companies[i].isActive) {
                activeCompanies[idx] = self.companies[i];
                idx++;
            }
        }
        return activeCompanies;
    }
}
