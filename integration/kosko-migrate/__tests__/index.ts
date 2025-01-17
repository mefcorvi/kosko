import execa from "execa";
import { runCLI } from "../../run";
import { join } from "path";
import fs from "fs";
import { promisify } from "util";

const fixtureDir = join(__dirname, "..", "__fixtures__");
const readFile = promisify(fs.readFile);

let args: string[];
let result: execa.ExecaReturnValue;
let options: execa.Options;

beforeEach(async () => {
  result = await runCLI(args, {
    ...options,
    cwd: fixtureDir
  });
});

describe("when filename is not given", () => {
  beforeAll(() => {
    args = ["migrate"];
    options = { reject: false };
  });

  test("should return status code 1", () => {
    expect(result.exitCode).toEqual(1);
  });

  test("should print the error", () => {
    expect(result.stderr).toMatchSnapshot();
  });
});

describe("when path is -", () => {
  beforeAll(async () => {
    args = ["migrate", "-f", "-"];
    options = {
      input: await readFile(join(fixtureDir, "only-deployment.yaml"))
    };
  });

  test("should return status code 0", () => {
    expect(result.exitCode).toEqual(0);
  });

  test("should print the output", () => {
    expect(result.stdout).toMatchSnapshot();
  });
});

describe("when path is a file", () => {
  beforeAll(() => {
    args = ["migrate", "-f", "only-deployment.yaml"];
    options = {};
  });

  test("should return status code 0", () => {
    expect(result.exitCode).toEqual(0);
  });

  test("should print the output", () => {
    expect(result.stdout).toMatchSnapshot();
  });
});

describe("when path is a directory", () => {
  beforeAll(() => {
    args = ["migrate", "-f", fixtureDir];
    options = {};
  });

  test("should return status code 0", () => {
    expect(result.exitCode).toEqual(0);
  });

  test("should print the output", () => {
    expect(result.stdout).toMatchSnapshot();
  });
});
