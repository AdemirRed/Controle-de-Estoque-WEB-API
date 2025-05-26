import Sequelize, { Model } from 'sequelize';

class PushSubscription extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        user_id: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        endpoint: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        keys: {
          type: Sequelize.JSON,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'push_subscriptions',
        timestamps: true,
      }
    );
    return this;
  }
}

export default PushSubscription;
