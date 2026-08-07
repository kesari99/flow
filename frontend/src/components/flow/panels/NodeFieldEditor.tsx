import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { NodeFieldType, type NodeField } from "@/schemas/flow-node.schema";

type NodeFieldEditorProps = {
  field: NodeField;
  onChange: (value: string | number | boolean) => void;
};

export function NodeFieldEditor({ field, onChange }: NodeFieldEditorProps) {
  switch (field.type) {
    case NodeFieldType.Text:
      return (
        <Input
          value={String(field.value)}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
          className="h-8 text-xs"
        />
      );
    case NodeFieldType.Textarea:
      return (
        <Textarea
          value={String(field.value)}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
          rows={4}
          className="min-h-[80px] resize-y font-mono text-xs"
        />
      );
    case NodeFieldType.Number:
      return (
        <Input
          type="number"
          value={Number(field.value)}
          onChange={(event) => onChange(parseFloat(event.target.value) || 0)}
          placeholder={field.placeholder}
          step="any"
          className="h-8 text-xs"
        />
      );
    case NodeFieldType.Select:
      return (
        <Select
          value={String(field.value)}
          onValueChange={(value) => onChange(value)}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="text-xs"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    case NodeFieldType.Toggle:
      return (
        <div className="flex items-center gap-2">
          <Switch
            checked={Boolean(field.value)}
            onCheckedChange={(checked) => onChange(checked)}
          />
          <Label className="text-xs text-muted-foreground">
            {field.value ? "Enabled" : "Disabled"}
          </Label>
        </div>
      );
  }
}
