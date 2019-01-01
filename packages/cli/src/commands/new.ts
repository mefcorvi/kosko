import { requireDefault, resolve } from "@kosko/require";
import { Template, writeFiles } from "@kosko/template";
import Debug from "debug";
import { baseOptions, BaseOptions, getCWD } from "../base";
import { help } from "../cli/help";
import { parse, ParseError } from "../cli/parse";
import { Command } from "../cli/types";
import { unparse } from "../cli/unparse";

const debug = Debug("kosko:new");

export interface NewArgs {
  template: string;
}

function buildTemplateCommand(
  name: string,
  template: Template<any>
): Command<any> {
  return {
    usage: `kosko new ${name}`,
    description: template.description,
    options: {
      ...baseOptions,
      ...template.options
    },
    async exec(ctx, argv) {
      const { options, errors } = parse(argv, this, {
        "halt-at-non-option": true
      } as any);
      const cwd = getCWD(options);

      if (options.help) {
        return help(this);
      }

      if (errors.length) {
        throw new ParseError(errors);
      }

      const result = await template.generate(options);
      await writeFiles(cwd, result.files);
    }
  };
}

export const newCmd: Command<BaseOptions> = {
  usage: "kosko new <template>",
  description: "Create files based on templates",
  options: baseOptions,
  args: [
    { name: "template", description: "Template to apply.", required: true }
  ],
  async exec(ctx, argv) {
    const { args, options, detail } = parse<BaseOptions, NewArgs>(argv, this, {
      "halt-at-non-option": true
    } as any);

    if (args.template) {
      const cwd = getCWD(options);
      const extensions = Object.keys(require.extensions);
      const path = await resolve(args.template, {
        basedir: cwd,
        extensions: extensions.length ? extensions : [".js"]
      });
      debug("Template path", path);

      const template = requireDefault(path);
      const cmd = buildTemplateCommand(args.template, template);
      return cmd.exec(ctx, unparse(detail).slice(1));
    }

    return help(this);
  }
};
