import { useEffect, useState } from "react";
import { TreeView, TreeItem } from "@mui/lab";
import Input from "@/common/Input/Input";
import { Popover } from "@mui/material";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import IndeterminateCheckBoxOutlinedIcon from "@mui/icons-material/IndeterminateCheckBoxOutlined";
import useAppState from "@/hooks/useAppState";
import "./OrgUnitSelector.css";
import { useTranslation } from "react-i18next";

const OrgUnitSelector = () => {
  const { t } = useTranslation();
  const { state, action } = useAppState();
  const [anchorEl, setAnchorEl] = useState(null);
  const [tree, setTree] = useState([]);
  const openPopover = Boolean(anchorEl);
  const { orgUnits, me } = state.metadata;
  const { orgUnit } = state.selection;

  useEffect(() => {
    const generated = generateTreeObject();
    setTree(generated);
  }, []);

  const generateTreeObject = () => {
    const transformed = orgUnits
      .filter((ou) => {
        let valid = false;
        me.dataViewOrganisationUnits.forEach((o) => {
          const foundAncestor =
            ou.ancestors.find((a) => a.id === o.id) || ou.id === o.id;
          if (foundAncestor) {
            valid = true;
            return;
          }
        });
        return valid;
      })
      .map((ou) => {
        const isRoot = me.dataViewOrganisationUnits.find((o) => o.id === ou.id);
        const newOu = { ...ou };
        if (isRoot) newOu.parent = null;
        return newOu;
      })
      .map((ou) => {
        const newOu = { ...ou };
        if (ou.parent) {
          newOu.parent = ou.parent.id;
        } else {
          newOu.parent = null;
        }
        return newOu;
      });
    const tree = (items, id = null, link = "parent") =>
      items
        .filter((item) => item[link] === id)
        .map((item) => ({ ...item, children: tree(items, item.id) }));
    const result = tree(transformed);
    return result;
  };

  const renderTree = (nodes) =>
    nodes.map((node) => {
      return (
        <TreeItem key={node.id} nodeId={node.id} label={node.displayName}>
          {Array.isArray(node.children)
            ? node.children.map((child) => renderTree([child]))
            : null}
        </TreeItem>
      );
    });
  return (
    <div className="org-unit-selector-container">
      <div
        onClick={(event) => {
          setAnchorEl(event.currentTarget);
        }}
      >
        <Input
          label={t("selectOrgUnit")}
          valueType="TEXT"
          value={orgUnit.displayName}
        />
      </div>
      <Popover
        open={openPopover}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        onClose={() => {
          setAnchorEl(null);
        }}
      >
        <div className="org-unit-tree-container">
          <TreeView
            selected={orgUnit.id ? [orgUnit.id] : []}
            expanded={
              orgUnit.id
                ? [...orgUnit.ancestors.map((a) => a.id), orgUnit.id]
                : []
            }
            defaultCollapseIcon={<IndeterminateCheckBoxOutlinedIcon />}
            defaultExpandIcon={<AddBoxOutlinedIcon />}
            onNodeSelect={(event, nodeId) => {
              const foundOu = orgUnits.find((ou) => ou.id === nodeId);
              action.selectOrgUnit(foundOu);
            }}
            onNodeToggle={(event, nodeId) => {
              const foundOu = orgUnits.find((ou) => ou.id === nodeId);
              action.selectOrgUnit(foundOu);
            }}
          >
            {renderTree(tree)}
          </TreeView>
        </div>
      </Popover>
    </div>
  );
};

export default OrgUnitSelector;
