import { Paper, Stack, Typography } from "@mui/material";

interface FeaturePlaceholderProps {
  description: string;
  title: string;
}

export const FeaturePlaceholder = ({
  description,
  title,
}: FeaturePlaceholderProps) => (
  <Paper
    component="section"
    elevation={0}
    sx={{ border: 1, borderColor: "divider", p: { xs: 3, md: 4 } }}
  >
    <Stack spacing={1}>
      <Typography component="h1" variant="h4">
        {title}
      </Typography>
      <Typography color="text.secondary">{description}</Typography>
    </Stack>
  </Paper>
);
