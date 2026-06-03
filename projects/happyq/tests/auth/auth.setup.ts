import path from 'path';
import { runAuthSetup } from '../../../../core/fixtures/auth.setup';

const SPREADSHEET = path.resolve(__dirname, '../../data/HappyQ_Tests.xlsx');
const AUTH_DIR = path.resolve(__dirname, '../../.auth');
const ENV_PATH = path.resolve(__dirname, '../../.env');
const LOGIN_URL = (process.env.BASE_URL ?? 'http://localhost:5173') + '/auth';

// Playwright calls this as a setup project — no test() wrapper needed
runAuthSetup(SPREADSHEET, AUTH_DIR, LOGIN_URL, ENV_PATH);
