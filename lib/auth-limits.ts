import crypto from "node:crypto";
import { query } from "./db";
export async function allowAuthAttempt(scope: string, identity: string, limit = 10, seconds = 900) {
  const key = crypto.createHash("sha256").update(scope + ":" + identity).digest("hex");
  const result = await query(`INSERT INTO auth_rate_limits (key,hits,expires_at) VALUES ($1,1,now()+$2*interval '1 second')
    ON CONFLICT (key) DO UPDATE SET hits=CASE WHEN auth_rate_limits.expires_at<now() THEN 1 ELSE auth_rate_limits.hits+1 END,
    expires_at=CASE WHEN auth_rate_limits.expires_at<now() THEN now()+$2*interval '1 second' ELSE auth_rate_limits.expires_at END
    RETURNING hits`, [key, seconds]);
  return result.rows[0].hits <= limit;
}
