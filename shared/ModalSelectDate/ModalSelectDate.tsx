import React from "react";
// ----------------------------- UI kitten -----------------------------------
import {
  Button,
  CalendarRange,
  RangeCalendar,
  StyleService,
  TopNavigation,
  useStyleSheet,
} from "@ui-kitten/components";
// ----------------------------- Components && Elements -----------------------
import { LayoutCustom, NavigationAction } from "shared/ui";
import { globalStyle } from "styles/globalStyle";
import EvaIcons from "types/eva-icon-enum";

interface IModalSelectDateProps {
  range: CalendarRange<Date>;
  close(): void;
  setRange: React.Dispatch<React.SetStateAction<CalendarRange<Date>>>;
}

const ModalSelectDate = React.memo(
  function ModalSelectDate({ range, close, setRange }: IModalSelectDateProps) {
    const styles = useStyleSheet(themedStyles);
    const [date, setDate] = React.useState<CalendarRange<Date>>(range);
    const _onConfirm = () => {
      setRange(date);
      close();
    };
    return (
      <LayoutCustom level="1" style={styles.contentModal}>
        <TopNavigation
          alignment="center"
          title={"Выберите дату"}
          accessoryLeft={() => (
            <NavigationAction
              marginLeft={8}
              icon={EvaIcons.CloseOutline}
              onPress={close}
            />
          )}
        />
        <RangeCalendar
          boundingMonth
          range={date}
          min={new Date(2000, 0, 1)}
          onSelect={(nextRange) => setDate(nextRange)}
        />
        <LayoutCustom horizontal gap={24} margin={24}>
          <Button
            status="danger"
            appearance="outline"
            style={styles.buttonConfirm}
            onPress={close}
          >
            Выход
          </Button>
          <Button
            style={styles.buttonConfirm}
            onPress={_onConfirm}
          >
            Принять
          </Button>
        </LayoutCustom>
      </LayoutCustom>
    );
  },
);

export default ModalSelectDate;

const themedStyles = StyleService.create({
  contentModal: {
    ...globalStyle.shadow,
    borderRadius: 16,
    overflow: "hidden",
    paddingTop: 8,
  },
  buttonConfirm: {
    flex: 1,
  },
});
