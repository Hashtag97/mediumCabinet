import { Checkbox } from "@material-ui/core";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormGroup from "@material-ui/core/FormGroup";
import { ChevronRight, ExpandMore } from "@material-ui/icons";
import { TreeItem, TreeView } from "@material-ui/lab";
import _ from "lodash";
import React, { memo, useContext } from "react";
import { DataContext } from "../App";

const Catalog = ({ times, setTimes }) => {
  const { cabineties  } = useContext(DataContext);


  return (
    <TreeView
      defaultCollapseIcon={<ExpandMore />}
      defaultExpandIcon={<ChevronRight />}
    >

      {cabineties.map((cabinet) => (
          <FormGroup key={cabinet.Cabinet.oid}>
                <FormControlLabel
                  control={
                    <Checkbox
                      key={cabinet.Cabinet.oid}
                      name={cabinet.Cabinet.oid}
                      color="primary"
                      checked={typeof times[cabinet.Cabinet.oid] !== "undefined"}
                      onChange={(_event, checked) =>
                        setTimes({
                          type: checked ? "ADD" : "DELETE",
                          id: cabinet.Cabinet.oid
                        })
                      }
                    />
                  }
                  label={cabinet.Cabinet.name}
                />
              </FormGroup>
    ))}
    </TreeView>
  );
};

export default memo(Catalog);
