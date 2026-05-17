import {
  createListCollection,
  Flex,
  Portal,
  Select,
  type SelectValueChangeDetails,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

type DobChangeHandler = (date: Date) => void;

const DOBInput = ({
  onChange,
  lang,
}: {
  onChange: DobChangeHandler;
  lang: string;
}) => {
  const langTimeFormatter = new Intl.DateTimeFormat(lang, { month: "long" });
  const [componentDateOBJ, setComponentDateOBJ] = useState(new Date());

  const { t: translate } = useTranslation(["auth"]);

  const currentYear = new Date().getFullYear();

  const handleMonthChange = (event: SelectValueChangeDetails) => {
    if (!event) return;
    const { value } = event;
    if (!value) return;
    const newDate = new Date(componentDateOBJ);
    newDate.setMonth(parseInt(value[0]));
    setComponentDateOBJ(newDate);
    onChange(newDate);
  };

  const handleYearChange = (event: SelectValueChangeDetails) => {
    if (!event) return;
    const { value } = event;
    if (!value) return;

    const newDate = new Date(componentDateOBJ);
    newDate.setFullYear(parseInt(value[0]));
    setComponentDateOBJ(newDate);
    onChange(newDate);
  };

  const handleDaysChange = (event: SelectValueChangeDetails) => {
    if (!event) return;
    const { value } = event;
    if (!value) return;
    const newDate = new Date(componentDateOBJ);
    newDate.setDate(parseInt(value[0]));
    setComponentDateOBJ(newDate);
    onChange(newDate);
  };

  const monthsCollection = createListCollection({
    items: Array.from({ length: 12 }, (_, i) => {
      const newDate = new Date(componentDateOBJ);
      newDate.setMonth(i);
      return {
        value: i.toString(),
        label: langTimeFormatter.format(newDate).trim(),
      };
    }),
    itemToString: (item) => item.label,
    itemToValue: (item) => item.value,
  });

  const yearsCollection = useMemo(() => {
    const numberFormatter = new Intl.NumberFormat(lang, {useGrouping: false});
    return createListCollection({
      items: Array.from({ length: 60 }, (_, index) => {
        const year = numberFormatter.format(currentYear - index);
        return { value: year, label: year.toString() };
      }),
      itemToString: (item) => item.label,
      itemToValue: (item) => item.value,
    });
  }, []);

  const daysInMonthCollection = useMemo(() => {
    const numberFormatter = new Intl.NumberFormat(lang);

    const daysInMonth = new Date(
      componentDateOBJ.getFullYear(),
      componentDateOBJ.getMonth() + 1,
      0
    ).getDate();

    return createListCollection({
      items: Array.from({ length: daysInMonth }, (_, index) => {
        const dayValue = (index + 1).toString();
        return {
          value: dayValue,
          label: numberFormatter.format(index + 1),
        };
      }),
      itemToString: (item) => item.label,
      itemToValue: (item) => item.value,
    });
  }, [componentDateOBJ.getFullYear(), componentDateOBJ.getMonth(), lang]);

  const formTBase = "signup.form";
  const monthPlaceHolder = translate(
    `${formTBase}.fields.dob.monthPlaceHolder`
  );
  const dayPlaceHolder = translate(`${formTBase}.fields.dob.dayPlaceHolder`);
  const yearPlaceHolder = translate(`${formTBase}.fields.dob.yearPlaceHolder`);

  return (
    <Flex gap="2" w="full" alignItems="center">
      <Select.Root
        id="selectMonth"
        onValueChange={handleMonthChange}
        collection={monthsCollection}
      >
        <Select.HiddenSelect />

        <Select.Control>
          <Select.Trigger fontSize="md" rounded="lg" pl="2" pr="2">
            <Select.ValueText placeholder={monthPlaceHolder} />
            <Select.Indicator />
          </Select.Trigger>
        </Select.Control>

        <Portal>
          <Select.Positioner>
            <Select.Content p="5px">
              {monthsCollection.items.map((month) => (
                <Select.Item
                  key={month.value}
                  fontSize="md"
                  padding="10px"
                  rounded="md"
                  item={month}
                >
                  {month.label} <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Portal>
      </Select.Root>

      <Select.Root
        id="selectDay"
        onValueChange={handleDaysChange}
        collection={daysInMonthCollection}
      >
        <Select.HiddenSelect />

        <Select.Control>
          <Select.Trigger fontSize="md" rounded="lg" pl="2" pr="2">
            <Select.ValueText placeholder={dayPlaceHolder} />
            <Select.Indicator />
          </Select.Trigger>
        </Select.Control>

        <Portal>
          <Select.Positioner>
            <Select.Content p="5px">
              {daysInMonthCollection.items.map((day) => (
                <Select.Item
                  fontSize="md"
                  padding="10px"
                  rounded="md"
                  item={day}
                  key={day.value}
                >
                  {day.label} <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Portal>
      </Select.Root>

      <Select.Root
        id="selectYear"
        onValueChange={handleYearChange}
        collection={yearsCollection}
      >
        <Select.HiddenSelect />

        <Select.Control>
          <Select.Trigger fontSize="md" rounded="lg" pl="2" pr="2">
            <Select.ValueText placeholder={yearPlaceHolder} />
            <Select.Indicator />
          </Select.Trigger>
        </Select.Control>

        <Portal>
          <Select.Positioner>
            <Select.Content p="5px">
              {yearsCollection.items.map((year) => (
                <Select.Item
                  key={year.value}
                  fontSize="md"
                  padding="10px"
                  rounded="md"
                  item={year}
                >
                  {year.label} <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Portal>
      </Select.Root>
    </Flex>
  );
};

export default DOBInput;





