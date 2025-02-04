import * as assert from "assert";

import inferFullTargets from "../../core/inferFullTargets";
import fixture from "./fixtures/inferFullTargets.fixture";

/*
 * FIXME: These tests are outdated and thus disabled for now
 */
suite.skip("inferFullTargets", () => {
  fixture.forEach(({ input, expectedOutput }, index) => {
    test(`inferFullTargets ${index}`, () => {
      assert.deepStrictEqual(
        inferFullTargets(
          input.partialTargets,
          input.actionPreferences
        ),
        expectedOutput
      );
    });
  });
});
