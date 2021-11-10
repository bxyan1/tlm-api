const { Sequelize, DataTypes } = require('sequelize');

class Database {
    constructor() {
        this.SFAccTable = db.define('SFAccTable', {
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
        
        this.SFContactTable = db.define('SFContactTable', {
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
        
        this.SFOpportunityTable = db.define('SFOpportunityTable', {
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
        
        this.SFContactRoleTable = db.define('SFContactRoleTable', {
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
        
        this.SFOppProductTable = db.define('SFOppProductTable', {
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
    }
}


async function initializeDb() {
  const db = new Sequelize('sqlite::memory:')
  try {
      await db.authenticate();
      console.log('Connection has been established successfully.');
  } catch (error) {
      console.error('Unable to connect to the database:', error);
  }
  return await db;

}

const db = initializeDb();
console.log(db);
const tables = new Database(db);

async function syncDb(tables) {
  await tables.SFAccTable.sync({ force: true });
  await tables.SFContactTable.sync({ force: true });
  await tables.SFOpportunityTable.sync({ force: true });
  await tables.SFContactRoleTable.sync({ force: true });
  await tables.SFOppProductTable.sync({ force: true });
}


module.exports = syncDb(tables);