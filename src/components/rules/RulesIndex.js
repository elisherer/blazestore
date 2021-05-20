import { Card, Grid } from "@material-ui/core";
import MonacoEditor from "../../monaco/MonacoEditor";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import OverlayLoader from "../OverlayLoader";
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineSeparator
} from "@material-ui/lab";
import { Star as StarIcon } from "@material-ui/icons";

const toFirestoreDate = dateString => {
  const date = new Date(dateString);
  const dateParts = date.toDateString().split(" ");
  const timeParts = date.toLocaleString().split(", ");
  return `${dateParts[1]} ${dateParts[2]}, ${dateParts[3]} • ${timeParts[1]}`;
};

const RulesIndex = () => {
  const params = useParams();
  const [rules, setRules] = useState();

  useEffect(() => {
    setRules(null);
    const controller = new AbortController();
    const { signal } = controller;
    fetch(`/api/project/${params.project}/rules`, { signal })
      .then(x => x.json())
      .then(res => setRules(res.result.ruleset))
      .catch(e => {
        if (e.name !== "AbortError") throw e;
      });
    return () => controller.abort();
  }, [params.project]);

  return (
    <Card sx={{ margin: "24px auto", width: "90%", overflow: "auto" }} elevation={4}>
      {rules ? (
        <Grid container>
          <Grid item xs={3}>
            <Timeline sx={{ "& .MuiTimelineItem-root:before": { display: "none" } }}>
              <TimelineItem>
                <TimelineSeparator>
                  <TimelineDot color="primary">
                    <StarIcon fontSize="small" />
                  </TimelineDot>
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent sx={{ my: 1 }} variant="body2" color="text.secondary">
                  {toFirestoreDate(rules.createTime)}
                </TimelineContent>
              </TimelineItem>
              <TimelineItem>
                <TimelineSeparator>
                  <TimelineDot variant="outlined">
                    <StarIcon fontSize="small" color="disabled" />
                  </TimelineDot>
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent sx={{ my: 1 }} variant="body2" color="text.secondary">
                  ...
                </TimelineContent>
              </TimelineItem>
            </Timeline>
          </Grid>
          <Grid item xs={9}>
            {rules.source.length > 0 && (
              <MonacoEditor
                language="firebaseRuleset"
                variant="modal"
                value={rules.source[0].content}
                readOnly
                minWidth="300px"
                height="430px"
              />
            )}
          </Grid>
        </Grid>
      ) : (
        <OverlayLoader />
      )}
    </Card>
  );
};

export default RulesIndex;
