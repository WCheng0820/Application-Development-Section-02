import React from "react";
import {
  Typography,
  CardContent,
  Button,
  Box,
  Chip,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

export default function BookingCards(props) {
  // Expect props: tutor, date, time, status, id, onCancel
  const { tutor, date, time, status, id, onCancel } = props;

  return (
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h6" fontWeight="bold">
            {tutor}
          </Typography>

          <Box display="flex" alignItems="center" gap={1} mt={1}>
            <CalendarMonthIcon fontSize="small" />
            <Typography>{date}</Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <AccessTimeIcon fontSize="small" />
            <Typography>{time}</Typography>
          </Box>
        </Box>

        <Box textAlign="right">
          <Chip
            label={status}
            color={status === "Confirmed" ? "success" : "warning"}
            sx={{ mb: 1 }}
          />
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => onCancel && onCancel(id)}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </CardContent>
  );
}
