// ESLint-API plugin, so the same module loads in ESLint and in oxlint (`jsPlugins`).

type Report = (descriptor: { node: unknown; message: string }) => void;

const classRules = [
  {
    pattern: String.raw`(^|[\s:])text-(xs|sm|base|lg|[2-9]?xl)(?=\s|$)`,
    message: "Use a type role (typeClass(role) or useSize().type) instead of a raw text size.",
  },
  {
    pattern: String.raw`(^|[\s:])duration-[1-9]\d*(?=\s|$)`,
    message: "Use a motion tier: duration-(--duration-fast|moderate|slow).",
  },
  {
    pattern: String.raw`(^|[\s:])text-[a-z-]+\/\d+(?=\s|$)`,
    message: "Text uses full-strength colours only, never an alpha step.",
  },
  {
    pattern: String.raw`svg[^\s]*:opacity-\d+`,
    message: "Never dim icons with opacity; use a full-strength colour token.",
  },
  {
    pattern: String.raw`(^|[\s:])(uppercase|tracking-(tighter|tight|wide|wider|widest|\[[^\]]+\]))(?=\s|$)`,
    message: "Hierarchy comes from size and weight: no uppercase or letter-spacing.",
  },
  {
    pattern: String.raw`(^|[\s:])hover:bg-(muted|accent)(?=[\s/]|$)`,
    message: "Hover fills use bg-hover.",
  },
].map((rule) => ({ regex: new RegExp(rule.pattern), message: rule.message }));

function checkClasses(report: Report, node: unknown, text: string) {
  for (const { regex, message } of classRules) {
    if (regex.test(text)) report({ node, message });
  }
}

type Property = { key?: { name?: string }; value?: { value?: unknown } };

const plugin = {
  meta: { name: "masmeert-ui" },
  rules: {
    "no-raw-classes": {
      create: (context: { report: Report }) => ({
        Literal(node: { value: unknown }) {
          if (typeof node.value === "string") checkClasses(context.report, node, node.value);
        },
        TemplateElement(node: { value: { raw: string } }) {
          checkClasses(context.report, node, node.value.raw);
        },
      }),
    },
    "no-raw-motion": {
      create: (context: { report: Report }) => ({
        // `duration` in seconds; 0 is a deliberate snap and loops (`repeat`) keep their own clock.
        ObjectExpression(node: { properties: Property[] }) {
          const duration = node.properties.find((p) => p.key?.name === "duration");
          const seconds = duration?.value?.value;
          if (typeof seconds !== "number" || seconds <= 0 || seconds >= 10) return;
          if (node.properties.some((p) => p.key?.name === "repeat")) return;
          context.report({
            node: duration,
            message:
              "Use a motion tier (spring, springExit or tierTween) instead of a hand-written duration.",
          });
        },
      }),
    },
  },
  configs: {} as Record<string, unknown>,
};

plugin.configs.recommended = {
  plugins: { "masmeert-ui": plugin },
  rules: { "masmeert-ui/no-raw-classes": "error", "masmeert-ui/no-raw-motion": "error" },
};

export default plugin;
