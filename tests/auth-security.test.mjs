import {test} from "node:test";
import assert from "node:assert/strict";
import {createSession,readSession,signPayload,hashPassword,verifyPassword,validUsername,sameOrigin,safeEqual} from "../lib/auth-security.ts";
import {paymentStatus} from "../lib/payment-status.ts";
process.env.AUTH_SECRET="test-only-secret-with-at-least-32-characters";
const id="f7cd5c50-90a7-4b3b-b4eb-0c0b74bc5b98";
test("session signed, tampered, malformed, expired and future",()=>{
 const token=createSession(id);assert.equal(readSession(token),id);
 for(const invalid of [token+"x","bad","a.b.c","",signPayload({kind:"session-v2",userId:id,issued:Date.now()-31*86400000}),signPayload({kind:"session-v2",userId:id,issued:Date.now()+100000})])assert.equal(readSession(invalid),null);
});
test("password hashes and malformed stored hashes",()=>{const hash=hashPassword("correct-password");assert.equal(verifyPassword("correct-password",hash),true);assert.equal(verifyPassword("wrong-password",hash),false);assert.equal(verifyPassword("password","broken"),false);assert.notEqual(hash,hashPassword("correct-password"));});
test("reserved and malformed usernames",()=>{for(const name of ["admin","about","contact","privacy","verify-email","UPPER","ab","a".repeat(31),"../../api"])assert.equal(validUsername(name),false);assert.equal(validUsername("roosevelt-17"),true);});
test("cross-origin requests refused",()=>{process.env.NEXT_PUBLIC_SITE_URL="https://buymedata.example";assert.equal(sameOrigin(new Request("https://buymedata.example/api",{headers:{origin:"https://attacker.example"}})),false);assert.equal(sameOrigin(new Request("https://buymedata.example/api",{headers:{origin:"https://buymedata.example"}})),true);assert.equal(sameOrigin(new Request("https://buymedata.example/api")),false);});
test("UTF8 comparison does not throw on unequal byte lengths",()=>{assert.equal(safeEqual("é","aa"),false);assert.equal(safeEqual("é","a"),false);});
test("only completed support is displayed as credited",()=>{assert.equal(paymentStatus("completed").credited,true);for(const status of ["pending","waiting_payment","failed","refunded","unexpected"])assert.equal(paymentStatus(status).credited,false);});
