/**
 * Standardized Application & API Error Definitions
 */

export interface ApiErrorResponse {
  error: string;
  code?: string;
  statusCode?: number;
  details?: unknown;
}

export interface FirewallViolationResponse {
  error: string;
  blocked: boolean;
  threats: string[];
  riskScore: number;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class FirewallSecurityError extends AppError {
  public readonly threats: string[];
  public readonly riskScore: number;

  constructor(message: string, threats: string[] = [], riskScore = 95) {
    super(message, 400);
    this.name = "FirewallSecurityError";
    this.threats = threats;
    this.riskScore = riskScore;
  }
}
