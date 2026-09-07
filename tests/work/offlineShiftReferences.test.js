const assert = require("node:assert/strict");
const test = require("node:test");

const {
  enrichStoredShiftReferences,
} = require("../../.test-build/src/utils/shiftDataUtils");

test("offline shift restores technique and work from local dictionaries", () => {
  const storedShift = {
    key: "stored-1",
    workType: "Field",
    workPlaceName: "Техника не указана",
    workName: "Работа не указана",
    agriculturalMachineryName: "",
    iconLink: "",
    techniqueStandardId: "TECHNIQUE-1",
    agriculturalMachineryId: "MACHINERY-1",
    tariffId: "TARIFF-1",
    workPlaceId: "",
  };

  const result = enrichStoredShiftReferences(
    [storedShift],
    [
      {
        techniqueStandard: {
          id: "technique-1",
          name: "Кировец К-744",
          icon_link: "https://example.test/technique.png",
        },
        machineryModel: {},
      },
    ],
    [
      {
        agriculturalMachineryStandard: {
          id: "machinery-1",
          name: "Борона",
        },
      },
    ],
    [],
    [{ id: "work-1", name: "Дискование" }],
    [
      {
        id: "tariff-1",
        work_standard_tariff_id: "tariff-1",
        work_standard_id: "work-1",
      },
    ],
  );

  assert.equal(result[0].workPlaceName, "Кировец К-744");
  assert.equal(result[0].workName, "Дискование");
  assert.equal(result[0].agriculturalMachineryName, "Борона");
  assert.equal(
    result[0].iconLink,
    "https://example.test/technique.png",
  );
});
