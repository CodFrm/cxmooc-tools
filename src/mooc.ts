import { RemoveInjected } from "./internal/utils/utils";
import { MoocFactory } from "./mooc/factory";
import { NewFrontendGetConfig } from "./internal/utils/config";
import { Application, Frontend } from "./internal/application";

RemoveInjected(document);

new Application(Frontend);

MoocFactory.CreateMooc(document.URL).Start();
