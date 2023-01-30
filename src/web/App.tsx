import {
  Box,
  AppBar,
  Typography,
  Toolbar,
  Stack,
  useTheme,
  FormControlLabel,
  Slider,
  FormControl,
  FormLabel,
  Slide,
} from "@mui/material";
import { grey, red } from "@mui/material/colors";
import { useCallback, useRef, useState } from "react";
import VirtualList from "../core";

export default function App() {
  return (
    <Box
      sx={{
        width: 1,
        minHeight: "100vh",
        px: 2,
      }}
    >
      <AppBar
        sx={{
          px: 2,
          py: 2,
        }}
      >
        <Typography component="h1" typography={"h5"}>
          Virtual list with milestones
        </Typography>
      </AppBar>
      <Toolbar
        sx={{
          height: 64,
          mb: 1,
        }}
      />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(2,45%)",
          justifyContent: "space-between",
        }}
      >
        <ListExample direciton="column" />
        <ListExample direciton="row" />
      </Box>
    </Box>
  );
}

type IListExampleProps = {
  direciton: "row" | "column";
};
const ListExample = (props: IListExampleProps) => {
  const { direciton } = props;

  const dataList = [
    "🍇",
    "🍉",
    "🍊",
    "🍋",
    "🍌",
    "🍍",
    "🥭",
    "🍎",
    "🍏",
    "🍐",
    "🍑",
    "🍒",
    "🍓",
    "🥝",
    "🍅",
    "🥥",
    "🍇",
    "🍉",
    "🍊",
    "🍋",
    "🍌",
    "🍍",
    "🥭",
    "🍎",
  ];

  const theme = useTheme();
  const renderFruilt = useCallback((item: string) => {
    return (
      <Box
        sx={{
          minHeight: 250,
          aspectRatio: "1 / 1",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: 100,
        }}
      >
        {item}
      </Box>
    );
  }, []);

  const [shouldRenderList, setShouldRenderList] = useState(false);
  const [spacing, setSpacing] = useState(0);

  const listRef = useRef<HTMLElement>();

  return (
    <Box>
      <Toolbar
        sx={{
          justifyContent: "space-between",
        }}
      >
        <Typography typography={"h6"} component={"h2"}>
          {direciton} virtual list
        </Typography>
        <FormControl sx={{ flexDirection: "row", alignItems: "center" }}>
          <FormLabel sx={{ mr: 2 }}>Item spacing</FormLabel>
          <Slider
            sx={{
              width: 200,
              "& .MuiSlider-valueLabel": {
                zIndex: theme.zIndex.tooltip,
              },
            }}
            marks
            valueLabelDisplay="auto"
            min={0}
            max={10}
            step={1}
            value={spacing}
            onChange={(e, v) => {
              if (typeof v === "number") {
                setSpacing(v);
              }
            }}
          />
        </FormControl>{" "}
      </Toolbar>{" "}
      <Stack
        alignItems={"center"}
        direction={direciton}
        spacing={spacing}
        ref={(node: Node) => {
          node && setShouldRenderList(true);
          listRef.current = node as HTMLElement;
        }}
        sx={{
          height: 500,
          overflow: "auto",
          border: 1,
          borderColor: theme.palette.divider,
          borderRadius: 1,
        }}
        id="vertical-list"
      >
        {shouldRenderList && (
          <VirtualList
            direction={direciton}
            renderItem={renderFruilt}
            itemCountBetweenTwoMilestones={5}
            data={dataList}
            intersectionOptions={{
              root: listRef.current,
            }}
          />
        )}
      </Stack>
    </Box>
  );
};
