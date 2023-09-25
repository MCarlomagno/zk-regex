const ff = require('ffjavascript');
const stringifyBigInts = ff.utils.stringifyBigInts;
const circom_tester = require("circom_tester");
const wasm_tester = circom_tester.wasm;
import * as path from "path";
const p = "21888242871839275222246405745257275088548364400416034343698204186575808495617";
const field = new ff.F1Field(p);
const apis = require("../../apis");
const option = {
    include: path.join(__dirname, "../../../node_modules")
};
import { readFileSync } from "fs";

jest.setTimeout(120000);
describe("Email Domain Regex", () => {
    it("test a regex of an email domain", async () => {
        const emailAddr = "suegamisora@gmail.com";
        const paddedEmailAddr = apis.padString(emailAddr, 256);
        const revealed = "gmail.com";
        const circuitInputs = {
            msg: paddedEmailAddr,
        };
        const circuit = await wasm_tester(path.join(__dirname, "./circuits/test_email_domain_regex.circom"), option);
        const witness = await circuit.calculateWitness(circuitInputs);
        await circuit.checkConstraints(witness);
        expect(1n).toEqual(witness[1]);
        for (let idx = 0; idx < 12; ++idx) {
            expect(0n).toEqual(witness[2 + idx]);
        }
        const prefixIdx = apis.extractSubstrIdxes(emailAddr, readFileSync(path.join(__dirname, "../circuits/common/email_domain.json"), "utf8"))[0][0];
        for (let idx = 0; idx < revealed.length; ++idx) {
            expect(BigInt(paddedEmailAddr[prefixIdx + idx])).toEqual(witness[2 + prefixIdx + idx]);
        }
    });
});