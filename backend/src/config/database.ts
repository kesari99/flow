import dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const env = process.env.NODE_ENV || 'dev';

interface DbConfig {
  url?: string;
  dialect: 'postgres';
  timezone: string;
  logging: boolean | ((sql: string, timing?: number) => void);
  define: {
    timestamps: boolean;
    underscored: boolean;
  };
  dialectOptions?: {
    ssl: {
      require: boolean;
      rejectUnauthorized: boolean;
    };
  };
  pool: {
    max?: number;
    min?: number;
    acquire?: number;
    idle?: number;
  };
}

interface Config {
  dev: DbConfig;
  uat: DbConfig;
  prod: DbConfig;
}

const config: Config = {
  dev: {
    url: process.env.DATABASE_URL,
    timezone: '+05:30',
    dialect: 'postgres',
    logging: console.log,
    define: {
      timestamps: true,
      underscored: true,
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
  uat: {
    url: process.env.DATABASE_URL,
    timezone: '+05:30',
    dialect: 'postgres',
    logging: console.log,
    define: {
      timestamps: true,
      underscored: true,
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
  prod: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    timezone: '+05:30',
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
};

const dbConfig = config[env as keyof typeof config];

export default dbConfig;
