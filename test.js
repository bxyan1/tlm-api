var crypto = require("crypto");
const { Sequelize, DataTypes } = require('sequelize');

const db = new Sequelize('sqlite::memory:')
async function initializeDb(db) {
    try {
        await db.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

const requestBody = {
    AADCaseText: '',
    AADCaseDate: '2021/11/04',
    AADName: 'Bill Yan',
    AADFirstName: 'Bill',
    AADLastName: 'Yan',
    AADEMail: 'byan@teradici.com',
    AADTenantRegion: 'NA',
    AADUserID: 'd8b3f979-48ef-4e75-a92a-829f58f9648e',
    AADSubscriptionID: 'd9f88ff3-26c7-4937-c090-b5840e40e317',
    AADTenantID: '715c7afb-027a-4b6e-9a60-dc385a62cf18',
    AADSubscriptionName: 'CAM TEST ENVIRONMENT (EPHEMERAL)',
    SFAccountName: '',
    SFAccountID: '',
    SFContactID: '',
    SFOpportunityID: '',
    SFOppContactRoleID: null,
    SFOppProductID: null,
    SFOpportunityNumber: '',
    TLMSubscription: {
      ID: 'd9f88ff3-26c7-4937-c090-b5840e40e317',
      Name: 'bytestapi',
      PlanName: 'cas_1year',
      OfferID: 'tlm_staging_site2-preview',
      BillingTerm: 'Monthly',
      StartDate: '2021-11-04',
      RenewDate: '2021-12-04',
      SFdcSKUID: 'cas_1year',
      SFdcSKUName: 'cas_1year',
      SFOppPricebookEntryId: '01u0M00000QM3lZQAT',
      SKUQuantity: 5
    },
    AADUserAddress: null,
    AADUserCity: null,
    AADUserPCode: null,
    AADUserState_Province: null,
    AADUserCountryCode: 'us'
}

function generateRandString(len) {
    var id = crypto.randomBytes(len / 2).toString('hex');
    return id.toUpperCase();
}

function generateRandNumber() {
    var minm = 100000;
    var maxm = 999999;
    let k = Math.floor(Math
    .random() * (maxm - minm + 1)) + minm;
    return k.toString();
}

function createSFAccount(db, subscriptionName, userCountryCode) {
    const accountId = generateRandString(18);
    console.log(accountId);
    db.create({AccountID: accountId, SubscriptionName: subscriptionName, UserCountryCode: userCountryCode})
    return accountId;
}

function createSFContact(db, lastname, SFAccID, firstName, email, userAddr, userCity, userCountryCode, userPhone, subName) {
    const contactId = generateRandString(18);
    db.create({LastName: lastname, SFAccountID: SFAccID, FirstName: firstName, Email: email, UserAddress: userAddr, UserCity: userCity, UserCountryCode: userCountryCode, UserPhone: userPhone, SubscriptionName: subName, ContactID: contactId});
    return contactId;
}

function createSFOpportunity(db, TLMSubscriptionName, startDate, renewDate, accID, TLMSubscriptionID) {
    const opportunityID = generateRandString(18);
    const opportunityNumber = generateRandNumber();
    db.create({TLMSubscriptionName, StartDate: startDate, RenewDate: renewDate, SFAccountID: accID, TLMSubscriptionID, OpportunityID: opportunityID, OpportunityNumber: opportunityNumber})
    return {opportunityID, opportunityNumber}
}

function createSFContactRole(db, SFContactID, opportunityID) {
    const contactRoleID = generateRandString(18);
    db.create({SFOpportunityID: opportunityID, SFContactID, SFContactRoleID: contactRoleID});
    return contactRoleID;
}

function createSFOppProduct(db, SKUQuantity, opportunityID, PricebookEntryId) {
    const productID = generateRandString(18);
    db.create({SFOpportunityID: opportunityID, SKUQuantity, PricebookEntryId, ProductID: productID});
    return productID;
}

function processRequest(requestBody, SFAccTable, SFContactTable, SFOpportunityTable, SFContactRoleTable, SFOppProductTable) {
    await SFAccTable.sync({ force: true });
    await SFContactTable.sync({ force: true });
    await SFOpportunityTable.sync({ force: true });
    await SFContactRoleTable.sync({ force: true });
    await SFOppProductTable.sync({ force: true });

    let aSFAccountID = requestBody.SFAccountID;
    let aSFContactID = requestBody.SFContactID;

    if (aSFAccountID.length < 15) {
        aSFAccountID = createSFAccount(SFAccTable, requestBody.AADSubscriptionName, requestBody.AADUserCountryCode);
        aSFContactID = createSFContact(SFContactTable, requestBody.AADLastName, aSFAccountID, requestBody.AADFirstName, requestBody.AADEMail, requestBody.AADUserAddress, requestBody.AADUserCity, requestBody.AADUserCountryCode, requestBody.AADUserPCode, requestBody.AADSubscriptionName);
    } else {
        if (aSFContactID.length < 15) {
            aSFContactID = createSFContact(SFContactTable, requestBody.AADLastName, aSFAccountID, requestBody.AADFirstName, requestBody.AADEMail, requestBody.AADUserAddress, requestBody.AADUserCity, requestBody.AADUserCountryCode, requestBody.AADUserPCode, requestBody.AADSubscriptionName);
        }
    }

    const { opportunityID, opportunityNumber } = createSFOpportunity(SFOpportunityTable, requestBody.TLMSubscription.Name, requestBody.TLMSubscription.StartDate, requestBody.TLMSubscription.RenewDate, aSFAccountID, requestBody.TLMSubscription.ID);
    const contactRoleID = createSFContactRole(SFContactRoleTable, aSFContactID, opportunityID);
    const productID = createSFOppProduct(SFOppProductTable, requestBody.TLMSubscription.SKUQuantity, opportunityID, requestBody.TLMSubscription.SFOppPricebookEntryId);

    return {
        SFAccountID: aSFAccountID,
        SFContactID: aSFContactID,
        SFOppContactRoleID: contactRoleID,
        SFOppProductID: productID,
        SFOpportunityID: opportunityID,
        SFOpportunityNumber: opportunityNumber 
    }
}

initializeDb(db);

const SFAccTable = db.define('SFAccTable', {
    AccountID: {
        type: DataTypes.STRING,
        allowNull: false
    },
    SubscriptionName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    UserCountryCode: {
        type: DataTypes.STRING
    }
});

const SFContactTable = db.define('SFContactTable', {
    LastName: {
        type: DataTypes.STRING
    },
    SFAccountID: {
        type: DataTypes.STRING,
        allowNull: false
    },
    FirstName: {
        type: DataTypes.STRING
    },
    Email: {
        type: DataTypes.STRING
    },
    UserAddress: {
        type: DataTypes.STRING
    },
    UserCity: {
        type: DataTypes.STRING
    },
    UserCountryCode: {
        type: DataTypes.STRING
    },
    UserPhone: {
        type: DataTypes.STRING
    },
    SubscriptionName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    ContactID: {
        type: DataTypes.STRING,
        allowNull: false
    }
}); 

const SFOpportunityTable = db.define('SFOpportunityTable', {
    TLMSubscriptionName: {
        type: DataTypes.STRING
    },
    StartDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    RenewDate: {
        type: DataTypes.DATEONLY
    },
    SFAccountID: {
        type: DataTypes.STRING,
        allowNull: false
    },
    TLMSubscriptionID: {
        type: DataTypes.STRING,
        allowNull: false
    },
    OpportunityID: {
        type: DataTypes.STRING,
        allowNull: false
    },
    OpportunityNumber: {
        type: DataTypes.STRING,
        allowNull: false
    }
})

const SFContactRoleTable = db.define('SFContactRoleTable', {
    SFOpportunityID: {
        type: DataTypes.STRING,
        allowNull: false
    },
    SFContactID: {
        type: DataTypes.STRING,
        allowNull: false
    },
    SFContactRoleID: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

const SFOppProductTable = db.define('SFOppProductTable', {
    SFOpportunityID: {
        type: DataTypes.STRING,
        allowNull: false
    },
    SKUQuantity: {
        type: DataTypes.TINYINT,
        allowNull: false
    },
    PricebookEntryId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    ProductID: {
        type: DataTypes.STRING,
        allowNull: false
    }
})
processRequest(requestBody, SFAccTable, SFContactTable, SFOpportunityTable, SFContactRoleTable, SFOppProductTable);