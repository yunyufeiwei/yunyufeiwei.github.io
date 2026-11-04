window.unityShaderReferenceData = [
  {
    "id": "pipeline",
    "label": "Pipeline(渲染管线)",
    "groups": [
      {
        "title": "应用程序阶段（Application Stage）",
        "entries": [
          {
            "title": "1.Application Stage",
            "body": "此阶段一般由CPU将需要在屏幕上绘制的几何体、摄像机位置、光照纹理等输出到管线的几何阶段。该阶段主要有3个任务：\n●准备场景数据：摄像机的位置、视椎体、场景模型数据、光源数据等等。\n●粗粒度剔除：为了提高渲染性能，需要执行该项，把那些不可见的物体剔除出去。\n●设置渲染状态：包括但不限于使用的材质（漫反射颜色、高光反射颜色）、使用的纹理、shader等等。"
          }
        ]
      },
      {
        "title": "几何阶段（Geometry Stage）",
        "entries": [
          {
            "title": "1.模型和视图变换（Model and View Transform）",
            "body": "●模型和视图变换阶段分为模型变换和视图变换。\n●模型变换的目的是将模型从本地空间变换到世界空间当中\n●视图变换的目的是将摄像机放置于坐标原点（以使裁剪和投影操作更简单高效）,将模型从世界空间变换到相机空间,以便后续步骤的操作。"
          },
          {
            "title": "2.顶点着色（Vertex Shading）",
            "body": "●顶点着色阶段的目的在于确定模型上顶点处的光照效果,其输出结果（颜色、向量、纹理坐标等）会被发送到光栅化阶段以进行插值操作。"
          },
          {
            "title": "3.几何、曲面细分着色器",
            "body": "●【可选项】分为几何着色器(Geometry Shader)和曲面细分着色器(Tessellation Shader)，主要是对顶点进行增加与删除修改等操作."
          },
          {
            "title": "4.投影（Projection）",
            "body": "●投影阶段分为正交投影与透视投影。\n●投影变换其实就是矩阵变换，最终会使坐标位于归一化的设备坐标NDC中，之所以叫投影就是因为最终Z轴坐标将被舍弃，也就是说此阶段主要的目的是将模型从三维空间投射到了二维的空间中的过程（但是坐标仍然是三维的，只是显示上看是二维的）。\n\n重点说明：观察空间（摄像机空间）和屏幕空间是不同的，观察空间（裁剪空间或齐次裁剪空间）设计一个三维空间，而屏幕空间是一个二维空间，而从观察空间到屏幕空间的转换需要经过一个操作，那就是投影（Projection Matrix）。"
          },
          {
            "title": "5.裁剪（Clipping）",
            "body": "裁剪根据图元在视体的位置分为三种情况：\n1.当图元完全位于视体内部，那么它可以直接进行下一个阶段。\n2.当图元完全位于视体外部，则不会进入下一个阶段，直接丢弃。\n3.当图元部分位于视体内部，则需要对位于视体内的图元进行裁剪处理。\n最终的目的就是对部分位于视体内部的图元进行裁剪操作，以使处于视体外部不需要渲染的图元进行裁剪丢弃。\n\n重点说明：在裁剪空间完成之后，其实还有一步NDC空间坐标，其实是在裁剪空间的基础上进行透视除法或称为齐次除法，得到的坐标空间。\n透视除法：将齐次坐标空间的positionHCS的xyz分量都除以w分量。经透视除法之后的点（x,y,z,1），其xyz的取值范围则在【-1,1】区间内。"
          },
          {
            "title": "6.屏幕映射（Screen Mapping）",
            "body": "屏幕映射阶段的主要目的，是将之前步骤得到的坐标映射到对应的屏幕坐标系上。"
          }
        ]
      },
      {
        "title": "光栅化阶段（Rasterizer Stage）",
        "entries": [
          {
            "title": "1.三角形设定（Triangle Setup）",
            "body": "此阶段主要是将从几何阶段得到的一个个顶点通过计算来得到一个个三角形网格。"
          },
          {
            "title": "2.三角形遍历（Triangle Traversal）",
            "body": "此阶段将进行逐像素遍历检查操作，以检查出该像素是否被上一步得到的三角形所覆盖，这个查找过程被称为三角形遍历。\n该阶段输出就是得到一个片元序列。一个片元并不是真正意义上的像素，而是包含了很多状态的集合，这些状态用于计算每个像素的最终颜色，包括但不限于屏幕坐标、深度信息，以及其它从几何阶段输出的顶点信息，例如法线、纹理坐标等。"
          },
          {
            "title": "3.像素着色(Pixel Shading)",
            "body": "对应于ShaderLab中的frag函数,主要目的是定义像素的最终输出颜色."
          },
          {
            "title": "4.混合（Merging）",
            "body": "主要任务是合成当前储存于缓冲器中的由之前的像素着色阶段产生的片段颜色。\n此阶段还负责可见性问题（Alpha测试、模版测试、深度测试、混合等）处理."
          }
        ]
      },
      {
        "title": "Shader Lab",
        "entries": [
          {
            "title": "Shader Lab",
            "body": "是Unity3D游戏引擎中用于编写Shader的语言，它不是一个独立的编程语言，而是一种结构化的语法，用于组织和配置Shader代码的各个部分."
          },
          {
            "title": "Property\n{\n}",
            "body": "该部分用来创建用于显示在面版上的属性."
          },
          {
            "title": "SubShader\n{\n}",
            "body": "每个Shader至少包含一个SubShader，它定义了一系列的通道（Pass），这些通道告诉Unity如何渲染物体，如果一个设备不支持第一个SubShader，Unity会尝试下一个SubShader，直到找到一个合适的."
          },
          {
            "title": "Pass\n{\n}",
            "body": "pass定义了实际的渲染步骤。每个Pass可以包含一段HLSL代码，这部分是实际的Shader程序，包括顶点和片元Shader."
          },
          {
            "title": "1.Attribute",
            "body": "将应用程序阶段的内容传递到顶点着色器中."
          },
          {
            "title": "2.Varyings(顶点着色器)",
            "body": "本地空间->(本地到世界空间矩阵)->世界空间->(世界到观察空间矩阵)->观察空间->(投影矩阵)->齐次裁剪空间."
          },
          {
            "title": "3.透视除法",
            "body": "齐次裁剪空间做透视除法(clip.xyzw/clip.w),变换到归一化设备坐标NDC."
          },
          {
            "title": "4.视口变换",
            "body": "从NDC坐标变换到屏幕坐标."
          },
          {
            "title": "5.frag(片段着色器)",
            "body": "用从顶点着色器的输出当做输入进行逐片段的颜色计算并输出."
          }
        ]
      }
    ]
  },
  {
    "id": "render-state",
    "label": "RenderState(渲染状态)",
    "groups": [
      {
        "title": "Cull",
        "entries": [
          {
            "title": "Cull Back | Front | Off",
            "body": "[Enum(UnityEngine.Rendering.CullMode)]_Cull(\"Cull\",Float) = 0\n背面剔除,默认值为Back。\nBack：\t表示剔除背面，也就是显示正面，这也是最常用的设置。\nFront：\t表示剔除前面，只显示背面。\nOff:      \t表示关闭剔除，也就是正反面都渲染。"
          }
        ]
      },
      {
        "title": "Stencil Test(模板测试)",
        "entries": [
          {
            "title": "Stencil",
            "body": "模板缓冲区(StencilBuffer)可以为屏幕上的每个像素点保存一个无符号整数值,这个值的具体意义视程序的具体应用而定.在渲染的过程中,可以用这个值与一个预先设定的参考值相比较,根据比较的结果来决定是否更新相应的像素点的颜色值.这个比较的过程被称为模板测试.\n将StencilBuffer的值与ReadMask与运算，然后与Ref值进行Comp比较，结果为true时进行Pass操作，否则进行Fail操作，操作值写入StencilBuffer前先与WriteMask与运算.\n模版缓冲中的默认值为:0\n公式：(Ref & ReadMask) Comp (StencilBufferValue & ReadMask)\n\nStencil\n{\n\n    Ref [_Stencil]\n    ReadMask [_StencilReadMask]\n    WriteMask [_StencilWriteMask]\n    Comp [_StencilComp] ((UnityEngine.Rendering.CompareFunction))\n    Pass [_StencilOp] (UnityEngine.Rendering.StencilOp)\n    Fail [_Fail]\n    ZFail [_ZFail]\n}\nRef:    \t设定的参考值,这个值将用来与模板缓冲中的值进行比较.取值范围位为0-255的整数.\nReadMask :\tReadMask的值将和Ref的值以及模板缓冲中的值进行按位与（&）操作,取值范围也是0-255的整数,默认值为255(二进制位11111111),即读取的时候不对Ref的值和模板缓冲中的值产生修改,读取的还是原始值.\nWriteMask:\tWriteMask的值是当写入模板缓冲时进行的按位与操作,取值范围是0-255的整数,默认值也是255,即不做任何修改.\nComp:\t定义Ref与模板缓冲中的值比较的操作函数,默认值为always.\nPass:   \t当模板测试（和深度测试）通过时,则根据（stencilOperation值）对模板缓冲值进行处理,默认值为keep.\nFail:       \t当模板测试（和深度测试）失败时,则根据（stencilOperation值）对模板缓冲值进行处理，默认值为keep.\nZFail:  \t当模板测试通过而深度测试失败时,则根据（stencilOperation值）对模板缓冲值进行处理，默认值为keep."
          },
          {
            "title": "Comp（比较操作）",
            "body": "\nLess：\t相当于“<”操作，即仅当左边<右边，模板测试通过，渲染像素.\nGreater：\t相当于“>”操作，即仅当左边>右边，模板测试通过，渲染像素.\nLequal：\t相当于“<=”操作，即仅当左边<=右边，模板测试通过，渲染像素.\nGequal：\t相当于“>=”操作，即仅当左边>=右边，模板测试通过，渲染像素.\nEqual：\t相当于“=”操作，即仅当左边=右边，模板测试通过，渲染像素.\nNotEqual：\t相当于“!=”操作，即仅当左边！=右边，模板测试通过，渲染像素.\nAlways：\t不管公式两边为何值，模板测试总是通过，渲染像素.\nNever:\t不管公式两边为何值，模板测试总是失败 ，像素被抛弃."
          },
          {
            "title": "模版缓冲区的更新",
            "body": "\nKeep：\t保留当前缓冲中的内容，即stencilBufferValue不变.\nZero：\t将0写入缓冲，即stencilBufferValue值变为0.\nReplace：\t将参考值写入缓冲，即将referenceValue赋值给stencilBufferValue.\nIncrSat：\t将当前模板缓冲值加1，如果stencilBufferValue超过255了，那么保留为255，即不大于255.\nDecrSat：\t将当前模板缓冲值减1，如果stencilBufferValue超过为0，那么保留为0，即不小于0.\nNotEqual：\t相当于“!=”操作，即仅当左边！=右边，模板测试通过，渲染像素.\nInvert：\t将当前模板缓冲值（stencilBufferValue）按位取反.\nIncrWrap:\t当前缓冲的值加1，如果缓冲值超过255了，那么变成0，（然后继续自增）.\nDecrWrap:\t当前缓冲的值减1，如果缓冲值已经为0，那么变成255，（然后继续自减）."
          }
        ]
      },
      {
        "title": "Depth Test(深度测试)",
        "entries": [
          {
            "title": "ZTest (Less | Greater | LEqual | GEqual | Equal | NotEqual | Never | Always)",
            "body": "深度测试，拿当前像素的深度值与深度缓冲中的深度值进行比较，默认值为LEqual。可通过在属性中添加枚举UnityEngine.Rendering.CompareFunction\n\nDisabled: 禁用，相当于永远通过。\nNever: 于永远不通过。\nLess：小于，表示如果当前像素的深度值小于深度缓冲中的深度值，则通过，以下类同。\nEqual：等于。\nLEqual：小于等于。\nGreater：大于。\nNotEqual：不等于。\nGequal：大于等于。\nAlways：永远通过。"
          },
          {
            "title": "ZTest[unity_GUIZTestMode]",
            "body": "unity_GUIZTestMode用于UI材质中，此值默认为LEqual,仅当UI中Canvas模式为Overlay时，值为Always."
          },
          {
            "title": "ZWrite On | Off",
            "body": "深度写入，默认值为On。\nOn：向深度缓冲中写入深度值。\nOff：关闭深度写入。"
          },
          {
            "title": "ZClip True | False",
            "body": "设置GPU的深度剪辑模式以此来决定如何处理近平面和远平面之外的片元深度.\nFalse表示将GPU的深度剪辑模式设置为Clmap,这对于模板阴影渲染很有用,这意味着当几何体超出远平面时不需要特殊处理，从而减少渲染操作。但是，它可能会导致不正确的Z排序。"
          },
          {
            "title": "Offset Factor, Units",
            "body": "深度偏移，offset = (m * factor) + (r * units)，默认值为0,0\nm：指多边形的深度斜率（在光栅化阶段计算得出）中的最大值,多边形越是与近裁剪面平行，m值就越接近0。\nr：表示能产生在窗口坐标系的深度值中可分辨的差异的最小值，r是由具体实现OpenGL的平台指定的一个常量。\n结论：一个大于0的offset会把模型推远，一个小于0的offset会把模型拉近。"
          }
        ]
      },
      {
        "title": "ColorMask(颜色遮罩)",
        "entries": [
          {
            "title": "ColorMask RGB | A | 0 | R、G、B、A的任意组合",
            "body": "颜色遮罩，默认值为：RGBA，表示写入RGBA四个通道。\n_ColorMask (\"Color Mask\", Float) = 15\nColorMask [_ColorMask]\n其中这里的15表示的是二进制，15在二进制中表示的是1111，即RGBA都使用。也使用ColorMask RGBA 或者 ColorMask R、ColorMask RG等组合方式。"
          }
        ]
      },
      {
        "title": "Blend(混合)",
        "entries": [
          {
            "title": "说明",
            "body": "源颜色*SrcFactor + 目标颜色*DstFactor\n颜色混合，源颜色与目标颜色以给定的公式进行混合出最终的新颜色。\n源颜色：当前Shader计算出的颜色。\n目标颜色：已经存在颜色缓存中的颜色。默认值为Blend Off,即表示关闭混合。\n在混合时可以针对某个RT做混合，比如Blend 3 One One,就是对RenderTarget3做混合。\n可在Properties中添加这个实现下拉列表选择:[Enum(UnityEngine.Rendering.BlendMode)]"
          },
          {
            "title": "Blend SrcFactor DstFactor",
            "body": "SrcFactor为源颜色因子，DstFactor为目标颜色因子，将两者按Op中指定的操作进行混合。"
          },
          {
            "title": "Blend SrcFactor DstFactor, SrcFactorA DstFactorA",
            "body": "对RGB和A通道分别做混合操作.\n对A的混合操作结果可以在FrameDebugger中的渲染目标RT中点选A通道来查看."
          },
          {
            "title": "BlendOp Op",
            "body": "混合时的操作运算符，默认值为Add（加法操作）。"
          },
          {
            "title": "BlendOp OpColor, OpAlpha",
            "body": "对RGB和A通道分别指定混合运算符。"
          },
          {
            "title": "Blend factors",
            "body": "混合因子\nOne：源或目标的完整值\nZero：0\nSrcColor：源的颜色值\nSrcAlpha：源的Alpha值\nDstColor：目标的颜色值\nDstAlpha：目标的Alpha值\nOneMinusSrcColor：1-源颜色得到的值\nOneMinusSrcAlpha：1-源Alpha得到的值\nOneMinusDstColor：1-目标颜色得到的值\nOneMinusDstAlpha：1-目标Alpha得到的值"
          },
          {
            "title": "Blend Types",
            "body": "常用的几种混合类型\nBlend SrcAlpha OneMinusSrcAlpha// Traditional transparency\nBlend One OneMinusSrcAlpha// Premultiplied transparency\nBlend One One\nBlend OneMinusDstColor One // Soft Additive\nBlend DstColor Zero // Multiplicative\nBlend DstColor SrcColor // 2x Multiplicative"
          },
          {
            "title": "Blend operations",
            "body": "混合操作的具体运算符\nAdd：源+目标\nSub：源-目标\nRevSub：目标-源\nMin：源与目标中最小值\nMax：源与目标中最大值\n以下仅用于DX11.1中\nLogicalClear\nLogicalSet\nLogicalCopy\nLogicalCopyInverted\nLogicalNoop\nLogicalInvert\nLogicalAnd\nLogicalNand\nLogicalOr\nLogicalNor\nLogicalXor\nLogicalEquiv\nLogicalAndReverse\nLogicalAndInverted\nLogicalOrReverse\nLogicalOrInverted"
          }
        ]
      },
      {
        "title": "Other(其它)",
        "entries": [
          {
            "title": "AlphaToMask On | Off",
            "body": "是否启用GPU上的alpha-to-coverage模式(当开启MSAA时,减少AlphaTest产生的过度锯齿感)."
          },
          {
            "title": "Conservative True | False",
            "body": "是否启用保守光栅化(指GPU对被三角形部分覆盖的像素进行光栅化,无论覆盖范围如何,这会导致更多片元着色器的调用)."
          }
        ]
      }
    ]
  },
  {
    "id": "property",
    "label": "Property(属性说明)",
    "groups": [
      {
        "title": "属性（Properties）",
        "entries": [
          {
            "title": "_Int(\"Int\",Integer) = 1",
            "body": "类型：整型\n说明：在URP下，如果要使用整数的表达方式，不能使用Int，必须要使用Integer"
          },
          {
            "title": "_Float(\"Float\",Float) = 0.1",
            "body": "类型：浮点型\n说明：根据需要定义不同的浮点精度，任何需要显式精度的函数，使用float或half限定符，当函数可以同时支持两者时，则使用real.\nhalf   16位精度，常用于本地坐标位置,方向等\nfloat  32位精度，常用于世界坐标位置以及uv坐标"
          },
          {
            "title": "_Slider(\"Slider\",Range(0,1)) = 0",
            "body": "类型：数值型滑动条\n说明：本质还是浮点型，只是通过Range(min,max)来控制滑动条的最小值与最大值"
          },
          {
            "title": "_Color(\"Color\",Color) = (1,1,1,1)",
            "body": "类型：颜色\n说明：用来表示颜色，通常是四维."
          },
          {
            "title": "_Vector(\"Vector\",Vector) = (1,1,1,1)",
            "body": "类型：向量\n说明：四维向量，在Property中无法定义二维或者三维向量，只能定义四维向量."
          },
          {
            "title": "_BaseMap (\"BaseMap\", 2D) = \"white\" {}",
            "body": "类型：2D纹理\n说明：默认值有white、black、gray、bump以及空，空就是white\n\nTEXTURE2D(_BaseMap);        SAMPLER(sampler_BaseMap);\nhalf4 baseMap = SAMPLE_TEXTURE2D(_BaseMap,sampler_BaseMap , i.uv);"
          },
          {
            "title": "_BaseMapArray(\"BaseMapArray\",2DArray) = \"white\"{}",
            "body": "类型：2D数组纹理\n说明：默认值有white、black、gray、bump以及空，空就是white，仅支持DX10、OpenGL3.0、Metal及以上版本\n\nTEXTURE2D_ARRAY(_BaseMapArray);     SAMPLER(sampler_BaseMapArray);\nhalf4 baseMapArray = SAMPLE_TEXTURE2D_ARRAY(_BaseMapArray , sampler_BaseMapArray , i.uv , 0);"
          },
          {
            "title": "_3DTexture(\"3DTexture\",3D) = \"white\"{}",
            "body": "类型：3D纹理，通常用作着色器的查找表，或用于表示体积数据。\n说明：\nTEXTURE3D(_3DTexture);    SAMPLER(sampler_3DTexture);"
          },
          {
            "title": "_Cube(\"Cube\",Cube) = \"_skybox\"{}",
            "body": "类型：立方体贴图\n说明：类似天空球一样的纹理，默认使用\"_skybox{}\"\n\nTEXTURECUBE(_Cube);       SAMPLER(sampler_Cube);\nhalf4 cubeMap = SAMPLE_TEXTURECUBE(_Cube,sampler_Cube,reflexDir);"
          }
        ]
      },
      {
        "title": "属性形式（Attribute）",
        "entries": [
          {
            "title": "[Header(xxx)]",
            "body": "用于在材质面板中当前属性的上方显示标题xxx，只支持英文、数字、空格以及下划线."
          },
          {
            "title": "[HideInInspector]",
            "body": "用于在材质面板隐藏此条属性，在不希望暴露某条属性时，可以快速将其隐藏."
          },
          {
            "title": "[Space(n)]",
            "body": "用于材质面板之间的属性，是属性之间具有间隔，n为间隔的数值大小."
          },
          {
            "title": "[HDR]",
            "body": "标记颜色属性为高动态范围."
          },
          {
            "title": "[PowerSlider(3)]",
            "body": "滑条曲率,必须加在range属性前面，用于控制滑动的数值比例,数值前面的部分会在滑动条上占更多的比例."
          },
          {
            "title": "[IntRange]",
            "body": "必须使用在Range属性之上，使材质面板中滑动条的数值只能生成整数."
          },
          {
            "title": "[Toggle]",
            "body": "开关属性，加在数值类型前面，可以使材质面板中的数值变成开关，0是关，1是开."
          },
          {
            "title": "[ToggleOff]",
            "body": "与Toggle相当，0是开，1是关."
          },
          {
            "title": "[Enum(Off, 0, On, 1)]",
            "body": "数值枚举,可直接在cg中使用此关键字来替代数字,最多可定义7个，超出后无法以下拉列表框的形式展现."
          },
          {
            "title": "[KeywordEnum (Enum0, Enum1, Enum2, Enum3, Enum4, Enum5, Enum6, Enum7, Enum8)]",
            "body": "关键字枚举,需要#pragma multi_compile _XXX_ENUM0 _XXX_ENUM1 ...来依次声明变体关键字,XXX为这条属性中声明的变量名,在cg/hlsl中可以通过#if #elif #endif分别做判断."
          },
          {
            "title": "[Enum (UnityEngine.Rendering.CullMode)]",
            "body": "内置枚举,可在Enum()内直接调用Unity内部的枚举."
          },
          {
            "title": "[NoScaleOffset]",
            "body": "只能加在纹理属性前，使其隐藏材质面板中的Tiling和Offset"
          },
          {
            "title": "[Normal]",
            "body": "只能加在纹理属性前，标记此纹理是用来接收法线贴图的，当用户指定了非法线的纹理时会在材质面板上进行警告提示"
          },
          {
            "title": "[Gamma]",
            "body": "Float和Vector属性默认情况下不会进行颜色空间转换，可以通过添加[Gamma]来指明此属性为sRGB值"
          },
          {
            "title": "[PerRendererData]",
            "body": "标记当前属性将以材质属性块的形式来自于每个渲染器数据"
          },
          {
            "title": "[MainTexture]",
            "body": "标记当前纹理为主纹理，便于C#通过Material.mainTexture调用"
          },
          {
            "title": "[MainColor]",
            "body": "标记当前颜色为主颜色，便于C#通过Material.color调用"
          }
        ]
      }
    ]
  },
  {
    "id": "semantics",
    "label": "Semantics(语义说明)",
    "groups": [
      {
        "title": "应用程序到顶点着色器的数据（Attribute）",
        "entries": [
          {
            "title": "float4 positionOS   : POSITION;",
            "body": "顶点的本地坐标"
          },
          {
            "title": "float3 normalOS     : NORMAL;",
            "body": "顶点的法线信息"
          },
          {
            "title": "float4 tangentOS    : TANGENT;",
            "body": "顶点的切线信息"
          },
          {
            "title": "float4 color             : COLOR;",
            "body": "顶点的顶点色信息"
          },
          {
            "title": "float4 texcoord      : TEXCOORD0;",
            "body": "顶点的UV1信息"
          },
          {
            "title": "float4 texcoord1     : TEXCOORD1;",
            "body": "顶点的UV2信息"
          },
          {
            "title": "float4 texcoord2     : TEXCOORD2;",
            "body": "顶点的UV3信息"
          },
          {
            "title": "float4 texcoord3     : TEXCOORD3;",
            "body": "顶点的UV4信息"
          }
        ]
      },
      {
        "title": "顶点着色器到片段着色器的数据（Varying）",
        "entries": [
          {
            "title": "float4 positionHCS  : SV_POSITION;",
            "body": "顶点的齐次裁剪空间下的坐标,默认情况下用POSITION也可以(PS4下不支持)，但是为了支持所有平台，所以最好使用SV_POSITION."
          },
          {
            "title": "float2 uv           : TEXCOORD0;",
            "body": "用来采样uv纹理的坐标，通常是float2，但也可以使用float4来定义,"
          },
          {
            "title": "注意事项",
            "body": "1.OpenGL ES2.0支持最多8个\n2.OpenGL ES3.0支持最多16个"
          }
        ]
      },
      {
        "title": "像素着色器语义（half4 frag）",
        "entries": [
          {
            "title": "half4 frag (Varyings i) : SV_Target\n{\n    half4 FinalColor;\n    return FinalColor;\n}",
            "body": "常用的像素着色器语义，这里的sv_Target语义等价于COLOR"
          },
          {
            "title": "如果要输出多个语义时，可是使用结构体的形式来编写。首先定义像素着色器输出结构体,然后在FragmentOutput frag(Varyings i)像素着色器输出中实现。",
            "body": "struct FragmentOutput\n{\n    half4 color : SV_Target;\n    half4 depth : SV_Depth;\n    half4 vFace : SV_IsFrontFace;\n}\nFragmentOutput frag (Varyings i) \n{\n    FragmentOutput o;\n    o.color = _Color * i.color;\n    o.depth = i.depth  -  _DepthBias;\n    return o;\n}"
          },
          {
            "title": "语义网址：",
            "body": "https://learn.microsoft.com/zh-cn/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics?redirectedfrom=MSDN#vertex-shader-semantics",
            "url": "https://learn.microsoft.com/zh-cn/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics?redirectedfrom=MSDN#vertex-shader-semantics"
          }
        ]
      }
    ]
  },
  {
    "id": "tags",
    "label": "Tags(标签说明)",
    "groups": [
      {
        "title": "Tags",
        "entries": [
          {
            "title": "Tags { \"TagName1\" = \"Value1\" \"TagName2\" = \"Value2\" }",
            "body": "Tag的语法结构，通过Tags{}来表示需要添加的标识,大括号内可以添加多组Tag（所以才叫Tags）,名称（TagName）和值（Value）是成对成对出现的，并且全部用字符串表示。"
          }
        ]
      },
      {
        "title": "RenderPipeline",
        "entries": [
          {
            "title": "\"RenderPipeline\" = \"UniversalPipeline\"",
            "body": "渲染管线标记，对应的管线C#代码UniversalRenderPipeline.cs中的Shader.globalRenderPipeline = UniversalPipeline,LightweightPipeline,只有带有UniversalPipeline或LightweightPipeline的Tag的SubShader才会生效.\n主要作用是用于标记当前这个SubShader是属于哪个管线下的."
          }
        ]
      },
      {
        "title": "Queue",
        "entries": [
          {
            "title": "Queue",
            "body": "渲染队列直接影响性能中的重复绘制，合理的队列可极大的提升渲染效率。\n渲染队列数<=2500的对象都被认为是不透明的物体（从前往后渲染），>2500的被认为是半透明物体（从后往前渲染）。\n\"Queue\" = \"Geometry+1\" 可通过在值后加数字的方式来改变队列。"
          },
          {
            "title": "\"Queue\" = \"Background\"",
            "body": "值为1000，此队列的对象最先进行渲染。"
          },
          {
            "title": "\"Queue\" = \"Geometry\"",
            "body": "默认值，值为2000，通常用于不透明对象，比如场景中的物件与角色等。"
          },
          {
            "title": "\"Queue\" = \"AlphaTest\"",
            "body": "值为2450，要么完全透明要么完全不透明，多用于利用贴图来实现边缘透明的效果，也就是美术常说的透贴。"
          },
          {
            "title": "\"Queue\" = \"Transparent\"",
            "body": "值为3000，常用于半透明对象，渲染时从后往前进行渲染，建议需要混合的对象放入此队列。"
          },
          {
            "title": "\"Queue\" = \"Overlay\"",
            "body": "值为4000,此渲染队列用于叠加效果。最后渲染的东西应该放在这里（例如镜头光晕等）。"
          }
        ]
      },
      {
        "title": "RenderType",
        "entries": [
          {
            "title": "RenderType",
            "body": "用来区别这个Shader要渲染的对象是属于什么类别的，你可以想像成是我们把各种不同的物体按我们需要的类型来进行分类一样。\n当然你也可以根据需要改成自定义的名称，这样并不会影响到Shader的效果。\n此Tag多用于摄像机的替换材质功能(Camera.SetReplacementShader)。"
          },
          {
            "title": "\"RenderType\" = \"Opaque\"",
            "body": "大多数不透明着色器。"
          },
          {
            "title": "\"RenderType\" = \"Transparent\"",
            "body": "大多数半透明着色器，比如粒子、特效、字体等。"
          },
          {
            "title": "\"RenderType\" = \"TransparentCutout\"",
            "body": "透贴着色器，多用于植被等。"
          },
          {
            "title": "\"RenderType\" = \"Background\"",
            "body": "多用于天空盒着色器。"
          },
          {
            "title": "\"RenderType\" = \"Overlay\"",
            "body": "GUI、光晕着色器等。"
          },
          {
            "title": "\"RenderType\" = \"TreeOpaque\"",
            "body": "Terrain地形中的树干。"
          },
          {
            "title": "\"RenderType\" = \"TreeTransparentCutout\"",
            "body": "Terrain地形中的树叶。"
          },
          {
            "title": "\"RenderType\" = \"TreeBillboard\"",
            "body": "Terrain地形中的永对面树。"
          },
          {
            "title": "\"RenderType\" = \"Grass\"",
            "body": "Terrain地形中的草。"
          },
          {
            "title": "\"RenderType\" = \"GrassBillboard\"",
            "body": "Terrain地形中的永对面草。"
          }
        ]
      },
      {
        "title": "LightMode",
        "entries": [
          {
            "title": "\"LightMode\" = \"UniversalForward\"",
            "body": "用于前向渲染路径，所有的灯光都在这一个pass中执行，包括GI、自发光、雾效.(在不需要光照的pass中，可以不写LightMode)"
          },
          {
            "title": "\"LightMode\" = \"SRPDefaultUnlit\"",
            "body": "用于在额外需要一个pass时使用."
          },
          {
            "title": "\"LightMode\" = \"ShadowCaster\"",
            "body": "用于生成阴影贴图ShadowMap(灯光视角下的深度信息)"
          },
          {
            "title": "\"LightMode\" = \"UniversalGBuffer\"",
            "body": "用于延迟渲染"
          },
          {
            "title": "\"LightMode\" = \"DepthOnly\"",
            "body": "用于生成相机下的深度信息,当管线资源上开启MSAA时会调用此pass."
          },
          {
            "title": "\"LightMode\" = \"DepthNormalsOnly\"",
            "body": "用于生成相机下的深度法线信息."
          },
          {
            "title": "\"LightMode\" = \"Meta\"",
            "body": "仅在光照烘焙时才会使用此Pass,用于间接光的反弹."
          },
          {
            "title": "\"LightMode\" = \"Universal2D\"",
            "body": "用于URP使用2D渲染器时绘制物体的Pass，不受光照影响."
          }
        ]
      },
      {
        "title": "DisableBatching",
        "entries": [
          {
            "title": "DisableBatching",
            "body": "在利用Shader在模型的顶点本地坐标下做一些位移动画，而当此模型有批处理时会出现效果不正确的情况，这是因为批处理会将所有模型转换为世界坐标空间，因此“本地坐标空间”将丢失。"
          },
          {
            "title": "\"DisableBatching\" = \"True\"",
            "body": "禁用批处理。"
          },
          {
            "title": "\"DisableBatching\" = \"False\"",
            "body": "不禁用批处理。"
          },
          {
            "title": "\"DisableBatching\" = \"LODFading\"",
            "body": "仅当LOD激活时禁用批处理。"
          }
        ]
      },
      {
        "title": "IgnoreProjector",
        "entries": [
          {
            "title": "IgnoreProjector",
            "body": "是否忽略Projector投影器的影响。"
          },
          {
            "title": "\"IgnoreProjector\" = \"True\"",
            "body": "不受投影器影响。"
          },
          {
            "title": "\"IgnoreProjector\" = \"False\"",
            "body": "受投影器影响。"
          }
        ]
      },
      {
        "title": "PreviewType",
        "entries": [
          {
            "title": "PreviewType",
            "body": "定义材质面板中的预览的模型显示,默认不写或者不为Plane与Skybox时则为圆球。"
          },
          {
            "title": "\"PreviewType\" = \"Plane\"",
            "body": "平面。"
          },
          {
            "title": "\"PreviewType\" = \"Skybox\"",
            "body": "天空盒。"
          }
        ]
      },
      {
        "title": "ForceNoShadowCasting",
        "entries": [
          {
            "title": "ForceNoShadowCasting",
            "body": "是否强制关闭投射阴影。"
          },
          {
            "title": "\"ForceNoShadowCasting\" = \"True\"",
            "body": "强制关闭阴影投射。"
          },
          {
            "title": "\"ForceNoShadowCasting\" = \"False\"",
            "body": "不关闭阴影投射。"
          }
        ]
      },
      {
        "title": "CanUseSpriteAtlas",
        "entries": [
          {
            "title": "CanUseSpriteAtlas",
            "body": "是否可用于打包图集的精灵。"
          },
          {
            "title": "\"CanUseSpriteAtlas\" = \"True\"",
            "body": "支持精灵打包图集。"
          },
          {
            "title": "\"CanUseSpriteAtlas\" = \"False\"",
            "body": "不支持精灵打包图集。"
          }
        ]
      },
      {
        "title": "PerformanceChecks",
        "entries": [
          {
            "title": "PerformanceChecks",
            "body": "是否对shader在当前平台进行性能检测，并在材质面板进行警告提示"
          },
          {
            "title": "\"PerformanceChecks\" = \"True\"",
            "body": "开启性能检测提示"
          },
          {
            "title": "\"PerformanceChecks\" = \"False\"",
            "body": "关闭性能检测提示"
          }
        ]
      }
    ]
  },
  {
    "id": "pragma",
    "label": "Pragma(编译指令)",
    "groups": [
      {
        "title": "Pragma(编译指令)",
        "entries": [
          {
            "title": "#Pragma是一个预处理指令，一般用来为Shader编译器提供额外的编译信息。为了便于管理，一般写在着色器头部。\n#pragma target XXX,Shader编绎目标级别，默认值为2.5。可以通过#if(SHADER_TARGET<30)来做分支判断。",
            "body": ""
          },
          {
            "title": "#pragma multi_compile_fog",
            "body": "雾类型定义\nFOG_EXP FOG_EXP2 FOG_LINEAR"
          },
          {
            "title": "#pragma multi_compile _ _FORWARD_PLUS",
            "body": "该关键字用来支持Shader可以在Forward+渲染管线上运行"
          }
        ]
      },
      {
        "title": "Target",
        "entries": [
          {
            "title": "● #pragma target 2.0：\n● #pragma target 2.5: derivatives(衍生品)\n● #pragma target 3.0: 2.5 + interpolators 10(内插器) + samplelod + fragcoord\n● #pragma target 3.5: (相当于OpenGL ES3.0): 3.0 + interpolators15 + mrt4 + integers + 2darray + instancing\n● #pragma target 4.0: 3.5 + geometry\n● #pragma target 4.5: (相当于OpenGL ES3.1): 3.5 + compute + randomwrite\n● #pragma target 4.6: 4.0 + cubearray + tesshw + tessellation\n● #pragma target 5.0: 4.0 + compute + randomwrite + tesshw + tessellation",
            "body": ""
          },
          {
            "title": "#pragma require xxx",
            "body": "表明shader需要的特性功能\n● interpolators10: 至少支持10个插值器(从顶点到片断)\n● interpolators15: 至少支持15个插值器(从顶点到片断)\n● interpolators32: 至少支持32个插值器(从顶点到片断)\n● mrt4: 至少支持4个Multiple Render Targets\n● mrt8: 至少支持8个Multiple Render Targets\n● derivatives: 片断着色器支持偏导函数(ddx/ddy)\n● samplelod: 纹理LOD采样\n● fragcoord: 将像素的位置(XY为屏幕上的坐标,ZW为齐次裁剪空间下的深度)传入到片断着色器中\n● integers: 支持真正的整数类型,包括位/移位操作\n● 2darray: 2D纹理数组\n● cubearray: Cubemap纹理数组\n● instancing: GPU实例化\n● geometry: 几何着色器\n● compute: Compute Shader\n● randomwrite: 可以编写任意位置的一些纹理和缓冲区 (UAV,unordered access views)\n● tesshw: GPU支持硬件的tessellation\n● tessellation: Tessellation hull/domain Shader\n● msaatex: 能够访问多采样纹理\n● framebufferfetch: 主要用于在延迟渲染中减少采样的带宽消耗"
          }
        ]
      },
      {
        "title": "ShaderVariant(Shader变体)",
        "entries": [
          {
            "title": "#pragma shader_feature",
            "body": "变体声明，常用于不需要程序控制开关的关键字，在编缉器的材质上设置，打包时会自动过滤"
          },
          {
            "title": "#pragma shader_feature_local",
            "body": "声明本地变体(shader_feature)，unity2019才支持的功能，每个Shader最多可以有64个本地变体，不占用全局变体的数量."
          },
          {
            "title": "#pragma multi_compile",
            "body": "变体声明，在打包时会把所有变体都打包进去，这是它与feature的区别.\n定义关键字时如果加两个下划线，则表示定义一个空的变体，主要目的是为了节省关键字.\n当使用shader变体时，记住在unity中全局关键字最多只有256个,而且在内部已经用了60个了,所以记得不要超标了."
          },
          {
            "title": "#pragma multi_compile_local",
            "body": "声明本地变体(multi_compile)，unity2019才支持的功能，每个Shader最多可以有64个本地变体，不占用全局变体的数量."
          },
          {
            "title": "#pragma skip_variants XXX01 XXX02...",
            "body": "剔除指定的变体，可同时剔除多个"
          },
          {
            "title": "#pragma shader_feature EDITOR_VISUALIZATION",
            "body": "开启Material Validation,Scene视图中的模式，用于查看超出范围的像素颜色"
          }
        ]
      },
      {
        "title": "Other",
        "entries": [
          {
            "title": "#pragma prefer_hlslcc gles",
            "body": "在OpenGL ES2.0中使用HLSLcc编译器,目前除了OpenGL ES2.0全都默认使用HLSLcc编译器."
          },
          {
            "title": "#include_with_pragmas \"XXX.hlsl\"",
            "body": "引入hlsl文件,同时也会使用hlsl文件中的#pragma指令"
          },
          {
            "title": "#pragma editor_sync_compilation",
            "body": "强制某个Shader以同步的方式进行编绎(当此Shader的某个变体被第一次渲染时，在还没有编绎完成前不会渲染出来;如果不加此指令则会先用一个青色的临时占位进行渲染显示。)"
          },
          {
            "title": "#pragma fragmentoption ARB_precision_hint_fastest",
            "body": "最快的,意思就是会用低精度(一般是指fp16),以提升片段着色器的运行速度,减少时间."
          },
          {
            "title": "#pragma fragmentoption ARB_precision_hint_nicest",
            "body": "最佳的,会用高精度(一般是指fp32),可能会降低运行速度,增加时间."
          },
          {
            "title": "#pragma enable_d3d11_debug_symbols",
            "body": "开启d3d11调试，加此命令后相关的名称与代码不会被剔除，便于在调试工具中进行查看分析"
          },
          {
            "title": "#pragma only_renderers",
            "body": "仅编译指定平台的Shader\n1. d3d11 - Direct3D 11/12\n2. glcore - OpenGL 3.x/4.x\n3. gles - OpenGL ES 2.0\n4. gles3 - OpenGL ES 3.x\n5. metal - iOS/Mac Metal\n6. vulkan - Vulkan\n7. d3d11_9x - Direct3D 11 9.x功能级别，通常在WSA平台上使用\n8. xboxone - Xbox One\n9. ps4 - PlayStation 4\n10.psp2 - PlayStation Vita\n11.n3ds - Nintendo 3DS\n12.wiiu - Nintendo Wii U"
          },
          {
            "title": "#pragma exclude_renderers",
            "body": "剔除掉指定平台的相关代码,列表参考上面"
          },
          {
            "title": "#define NAME",
            "body": "定义一个叫NAME的字段，在CG代码中可以通过#if defined(NAME)来判断走不同的分支。"
          },
          {
            "title": "#define NAME 1",
            "body": "定义一个叫NAME的字段并且它的值为1.\n1.可以通过#if defined(NAME)来判断走不同的分支。\n2.可以通过#if NAME来判断走不同的分支。（此时值为非0时才有效，为0时不走此分支）\n3.还可以直接通过NAME来得到它的值，比如上面的1。"
          },
          {
            "title": "#error xxx",
            "body": "多用于分支的判断中，利用此语句可直接输出一条报错信息，内容为xxx"
          }
        ]
      }
    ]
  },
  {
    "id": "transformation",
    "label": "Transformation(变换)",
    "groups": [
      {
        "title": "位置与方向(矢量)",
        "entries": [
          {
            "title": "矢量表示写法",
            "body": "Unity提供的内置矩阵是4X4的矩阵，与矢量左乘(矩阵放左边)就能得到变换新坐标后的矢量数据.\nUnity矢量必须写成四维度而不是三维，位置写成(x,y,z,1),方向写成(x,y,z,0)\n例如：\n模型空间的顶点位置变换到世界空间的顶点位置:\nfloat3 positionWS = mul(UNITY_MATRIX_M , float4(positionOS , 1).xyz;\n模型空间的法线方向变换到相机空间的法线方向:\n方法一：float3 normalVS = mul(UNITY_MATRIX_IT_MV , float4(normalOS , 0)).xyz);\n方法二：float3 normalVS = mul((float3x3)UNITY_MATRIX_IT_MV , normalOS);"
          }
        ]
      },
      {
        "title": "空间变换(矩阵)",
        "entries": [
          {
            "title": "UNITY_MATRIX_M",
            "body": "模型变换矩阵(unity_ObjectToWorld):通常用于把矢量从模型空间变换到世界空间"
          },
          {
            "title": "UNITY_MATRIX_I_M",
            "body": "模型变换逆矩阵(unity_WorldToObject):通常用于把矢量从世界空间变换到模型空间"
          },
          {
            "title": "UNITY_MATRIX_V",
            "body": "视图变换矩阵(unity_MatrixV):通常用于把矢量从世界空间变换到相机空间"
          },
          {
            "title": "UNITY_MATRIX_I_V",
            "body": "视图变换逆矩阵(unity_MatrixInvV):通常用于把矢量从相机空间变换到世界空间"
          },
          {
            "title": "UNITY_MATRIX_P",
            "body": "投影变换矩阵(OptimizeProjectionMatrix(glstate_matrix_projection)):通常用于把矢量从相机空间变换到裁剪空间"
          },
          {
            "title": "UNITY_MATRIX_I_P",
            "body": "投影变换逆矩阵(ERROR_UNITY_MATRIX_I_P_IS_NOT_DEFINED):通常用于把矢量从裁剪空间变换到相机"
          },
          {
            "title": "UNITY_MATRIX_VP",
            "body": "视图投影变换矩阵(unity_MatrixVP):通常用于把矢量从世界空间变换到裁剪空间"
          },
          {
            "title": "UNITY_MATRIX_I_VP",
            "body": "视图投影变换逆矩阵(_InvCameraViewProj):通常用于把矢量从裁剪空间变换到世界空间"
          },
          {
            "title": "UNITY_MATRIX_MV",
            "body": "模型视图变换矩阵(mul(UNITY_MATRIX_V, UNITY_MATRIX_M)):通常用于把矢量从模型空间变换到相机空间"
          },
          {
            "title": "UNITY_MATRIX_T_MV",
            "body": "模型视图变换转置矩阵(transpose(UNITY_MATRIX_MV)):模型视图矩阵的转置式"
          },
          {
            "title": "UNITY_MATRIX_IT_MV",
            "body": "模型视图变换转置逆矩阵(transpose(mul(UNITY_MATRIX_I_M, UNITY_MATRIX_I_V))):把法线从模型空间变换到相机空间"
          },
          {
            "title": "UNITY_MATRIX_MVP",
            "body": "模型视图投影变换矩阵(mul(UNITY_MATRIX_VP, UNITY_MATRIX_M)):通常用于把矢量从模型空间变换到裁剪空间"
          }
        ]
      },
      {
        "title": "空间变换(方法)",
        "entries": [
          {
            "title": "float3 TransformObjectToWorld(float3 positionOS)",
            "body": "模型空间>>世界空间"
          },
          {
            "title": "float3 TransformWorldToObject(float3 positionWS)",
            "body": "世界空间>>模型空间"
          },
          {
            "title": "float3 TransformWorldToView(float3 positionWS)",
            "body": "世界空间>>视图空间"
          },
          {
            "title": "float4 TransformObjectToHClip(float3 positionOS)",
            "body": "模型空间>>齐次裁剪空间 (比MVP高效)"
          },
          {
            "title": "float4 TransformWorldToHClip(float3 positionWS)",
            "body": "世界空间>>齐次裁剪空间"
          },
          {
            "title": "float4 TransformWViewToHClip(float3 positionVS)",
            "body": "视图空间>>齐次裁剪空间"
          },
          {
            "title": "real3 TransformObjectToWorldDir(real3 dirOS)",
            "body": "(向量)模型空间>>世界空间"
          },
          {
            "title": "real3 TransformWorldToObjectDir(real3 dirWS)",
            "body": "(向量)世界空间>>模型空间"
          },
          {
            "title": "real3 TransformWorldToViewDir(real3 dirWS)",
            "body": "(向量)世界空间>>视图空间"
          },
          {
            "title": "real3 TransformWorldToHClipDir(real3 directionWS)",
            "body": "(向量)世界空间>齐次裁剪空间"
          },
          {
            "title": "float3 TransformObjectToWorldNormal(float3 normalOS)",
            "body": "(法线)模型空间>>世界空间(已归一化)"
          },
          {
            "title": "float3 TransformWorldToObjectNormal(float3 normalWS)",
            "body": "(法线)世界空间>>模型空间(已归一化)"
          }
        ]
      },
      {
        "title": "基础变换矩阵",
        "entries": [
          {
            "title": "平移矩阵",
            "body": "float4x4 M_translate = float4x4(\n\t1, 0, 0, T.x,\n\t0, 1, 0, T.y,\n\t0, 0, 1, T.z,\n\t0, 0, 0, 1);"
          },
          {
            "title": "缩放矩阵",
            "body": "float4x4 M_scale = float4x4(\n\tS.x, 0, 0, 0,\n\t0, S.y, 0, 0,\n\t0, 0, S.z, 0,\n\t0, 0, 0, 1);"
          },
          {
            "title": "旋转矩阵(X轴)",
            "body": "float4x4 M_rotationX = float4x4(\n\t1, 0, 0, 0,\n\t0, cos(θ), -sin(θ), 0,\n\t0, sin(θ), cos(θ), 0,\n\t0, 0, 0, 1);"
          },
          {
            "title": "旋转矩阵(Y轴)",
            "body": "float4x4 M_rotationY = float4x4(\n\tcos(θ), 0, sin(θ), 0,\n\t0, 1, 0, 0,\n\t-sin(θ), 0, cos(θ), 0,\n\t0, 0, 0, 1);"
          },
          {
            "title": "旋转矩阵(Z轴)",
            "body": "float4x4 M_rotationZ = float4x4(\n\tcos(θ), -sin(θ), 0, 0,\n\tsin(θ), cos(θ), 0, 0,\n\t0, 0, 1, 0,\n\t0, 0, 0, 1);"
          },
          {
            "title": "旋转矩阵(任意轴)",
            "body": "float3 Unity_RotateAboutAxis_Radians_float(float3 In, float3 Axis, float Rotation)\n{\n    \tfloat s = sin(Rotation);\n    \tfloat c = cos(Rotation);\n    \tfloat one_minus_c = 1.0 - c;\n    \tAxis = normalize(Axis);\n    \tfloat3x3 rot_mat =\n\t{\n            one_minus_c * Axis.x * Axis.x + c, one_minus_c * Axis.x * Axis.y - Axis.z * s, one_minus_c * Axis.z * Axis.x + Axis.y * s,\n            one_minus_c * Axis.x * Axis.y + Axis.z * s, one_minus_c * Axis.y * Axis.y + c, one_minus_c * Axis.y * Axis.z - Axis.x * s,\n            one_minus_c * Axis.z * Axis.x - Axis.y * s, one_minus_c * Axis.y * Axis.z + Axis.x * s, one_minus_c * Axis.z * Axis.z + c \n\t};\n    return  mul(rot_mat,  In);\n}"
          }
        ]
      },
      {
        "title": "变换规则",
        "entries": [
          {
            "title": "将P点从A空间变换到B空间",
            "body": "P_B = M_AB * P_A\n       = (M_BA)^-1 * P_A\n       = (M_BA)^T * P_A)"
          }
        ]
      }
    ]
  },
  {
    "id": "shader-library",
    "label": "ShaderLibrary(库文件引用)",
    "groups": [
      {
        "title": "ShaderLibrary",
        "entries": [
          {
            "title": "#include \"Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl\"\n#include \"Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl\"\n#include \"Packages/com.unity.render-pipelines.universal/ShaderLibrary/ShaderGraphFunctions.hlsl\"\n#include \"Packages/com.unity.render-pipelines.core/ShaderLibrary/Color.hlsl\"\n#include \"Packages/com.unity.render-pipelines.core/ShaderLibrary/UnityInstancing.hlsl\"",
            "body": ""
          },
          {
            "title": "#include \"XXX.hlsl\"\n",
            "body": "引入自定义的hlsl文件\n方案一：绝对路径，Asset/XX/xx.hlsl \n方案二：相对路径，同层级的话使用./xx.hlsl.     上一层级使用../xx.hlsl.       上层级的同级目录下使用../xx/xx.hlsl"
          }
        ]
      },
      {
        "title": "Other",
        "entries": [
          {
            "title": "CBUFFER_START(UnityPerMaterial)\nCBUFFER_END\n",
            "body": "将材质属性面板中的变量定义在这个常量缓冲区中，用于支持SRP Batcher.\nGlobalProperty(全局属性)不能放在CBUFFER里面，否则会破坏SRPBatch机制，应该直接放置该代码片段之外。"
          },
          {
            "title": "HLSLPROGRAM\nENDHLSL\n",
            "body": "HLSL代码的开始与结束."
          },
          {
            "title": "HLSLINCLUDE\nENDHLSL\n",
            "body": "通常用于定义多段vert/frag函数，然后这段CG代码会插入到所有Pass的CG中，根据当前Pass的设置来选择加载."
          },
          {
            "title": "LOD\n",
            "body": "Shader LOD，可利用脚本来控制LOD级别，通常用于不同配置显示不同的SubShader。注意SubShader要从高往低写，要不然会无法生效."
          },
          {
            "title": "Category{}\n",
            "body": "定义一组所有SubShader共享的命令，位于SubShader外面。"
          },
          {
            "title": "Name \"MyPassName\"\n",
            "body": "给当前Pass指定名称，以便利用UsePass进行调用。"
          },
          {
            "title": "UsePass \"Shader/NAME\"\n",
            "body": "调用其它Shader中的Pass，注意Pass的名称要全部大写！Shader的路径也要写全，以便能找到具体是哪个Shader的哪个Pass。另外加了UsePass后，也要注意相应的Properties要自行添加。"
          },
          {
            "title": "Fallback \"name\"\n",
            "body": "备胎，当Shader中没有任何SubShader可执行时，则执行FallBack。默认值为Off,表示没有备胎。\n比如URP下默认的紫色报错Shader:Fallback \"Hidden/Universal Render Pipeline/FallbackError\""
          },
          {
            "title": "CustomEditor \"name\"\n",
            "body": "自定义材质面板，name为自定义的脚本名称。可利用此功能对材质面板进行个性化自定义。"
          }
        ]
      }
    ]
  },
  {
    "id": "built-in",
    "label": "Build-In Variables(内置变量)",
    "groups": [
      {
        "title": "Vert",
        "entries": [
          {
            "title": "UNITY_INITIALIZE_OUTPUT(type,name)",
            "body": "由于HLSL编缉器不接受没有初始化的数据，所以为了支持所有平台，从而需要使用此方法进行初始化.\nVarying o = (Varying)0"
          },
          {
            "title": "o.uv = TRANSFORM_TEX(i.uv,_MainTex)",
            "body": "对UV进行Tiling与Offset变换,也可以将其拆开。\no.uv = v.texcoord.xy * _BaseMap_ST.xy + _BaseMap_ST.zw"
          },
          {
            "title": "float3 UnityWorldSpaceLightDir( float3 worldPos )",
            "body": "返回顶点到灯光的向量"
          }
        ]
      },
      {
        "title": "CameraAndScreen",
        "entries": [
          {
            "title": "Camera相关参数",
            "body": "相机在世界空间下的位置坐标(xyz):_WorldSpaceCameraPos\n相机指向前方的方向:-1 * mul(UNITY_MATRIX_M, transpose(mul(UNITY_MATRIX_I_M, UNITY_MATRIX_I_V)) [2].xyz);\n是否是正交相机(1为正交,0为透视):unity_OrthoParams.w\n近裁剪面:_ProjectionParams.y\n远裁剪面:_ProjectionParams.z\nZ Buffer方向(-1为反向,1为正向):_ProjectionParams.x\n正交相机的宽度:unity_OrthoParams.x\n正交相机的高度:unity_OrthoParams.y"
          },
          {
            "title": "_ZBufferParams",
            "body": "传统Z方向:\nx=1-far/near\ny=far/near\nz=x/far\nw=y/far\n\n反向Z:\nx=-1+far/near\ny=1\nz=x/far\nw=1/far"
          },
          {
            "title": "深度:_CameraDepthTexture",
            "body": "在PipelineAsset中勾选DepthTexture.\n#define REQUIRE_DEPTH_TEXTURE\t//直接这样定义可以省去声明纹理的步骤(直接使用内部hlsl中的定义)\nTEXTURE2D (_CameraDepthTexture);SAMPLER(sampler_CameraDepthTexture);\nfloat2 screenUV = i.positionCS/_ScreenParams.xy;\nhalf4 depthMap = SAMPLE_TEXTURE2D(_CameraDepthTexture, sampler_CameraDepthTexture, screenUV);\nhalf depth = Linear01Depth(depthMap, _ZBufferParams);"
          },
          {
            "title": "线性深度转换",
            "body": "从深度图中得到顶点的线性深度值(相机位置=0，相机远裁剪面=1)\nLinear01Depth(depthMap, _ZBufferParams);\n从深度图中得到顶点的线性深度值(不是0-1的范围)\nLinearEyeDepth(depthMap, _ZBufferParams);"
          },
          {
            "title": "抓屏:_CameraOpaqueTexture",
            "body": "在PipelineAsset中勾选OpaqueTexture,同时这个抓屏只能在半透明序列下正确执行.\n#define REQUIRE_OPAQUE_TEXTURE\t//直接这样定义可以省去声明纹理的步骤(直接使用内部hlsl中的定义)\nTEXTURE2D (_CameraOpaqueTexture);SAMPLER(sampler_CameraOpaqueTexture);\nfloat2 screenUV = i.positionCS.xy / _ScreenParams.xy;\nhalf4 screenColor = SAMPLE_TEXTURE2D(_CameraOpaqueTexture, sampler_CameraOpaqueTexture, screenUV);"
          },
          {
            "title": "_ScreenParams",
            "body": "屏幕的相关参数，单位为像素。\nx表示屏幕的宽度\ny表示屏幕的高度\nz表示1+1/屏幕宽度\nw表示1+1/屏幕高度"
          },
          {
            "title": "_ScaledScreenParams",
            "body": "同上，但是有考虑到RenderScale的影响."
          }
        ]
      },
      {
        "title": "Time",
        "entries": [
          {
            "title": "_Time",
            "body": "时间，主要用于在Shader做动画,类型：float4\nx = t/20\ny = t\nz = t*2\nw = t*3"
          },
          {
            "title": "_SinTime",
            "body": "t是时间的正弦值，返回值(-1~1): \nx = t/8\ny = t/4\nz = t/2\nw = t"
          },
          {
            "title": "_CosTime",
            "body": "t是时间的余弦值，返回值(-1~1):\nx = t/8\ny = t/4\nz = t/2\nw = t"
          },
          {
            "title": "unity_DeltaTime",
            "body": "dt是时间增量,smoothDt是平滑时间\nx = dt\ny = 1/dt\nz = smoothDt\nz = 1/smoothDt"
          }
        ]
      },
      {
        "title": "GPU Instancing",
        "entries": [
          {
            "title": "实现步骤",
            "body": "用于对多个对象(网格一样，材质一样，但是材质属性不一样)合批,单个合批最大上限为511个对象.\n1.#pragma multi_compile_instancing 添加此指令后会使材质面板上曝露Instaning开关,同时会生成相应的Instancing变体(INSTANCING_ON).\n2.UNITY_VERTEX_INPUT_INSTANCE_ID 在顶点着色器的输入(appdata)和输出(v2f可选)中添加(uint instanceID : SV_InstanceID).\n3.构建需要实例化的额外数据:\n\t#ifdef UNITY_INSTANCING_ENABLED\n\tUNITY_INSTANCING_BUFFER_START(prop自定义名字)\n\tUNITY_DEFINE_INSTANCED_PROP(vector, _BaseColor)\n\tUNITY_INSTANCING_BUFFER_END(prop自定义名字)\n\t#endif\n4.UNITY_SETUP_INSTANCE_ID(v); 放在顶点着色器/片断着色器(可选)中最开始的地方,这样才能访问到全局变量unity_InstanceID.\n5.UNITY_TRANSFER_INSTANCE_ID(v, o); 当需要将实例化ID传到片断着色器时,在顶点着色器中添加.\n6.UNITY_ACCESS_INSTANCED_PROP(arrayName, propName) 在片断着色器中访问具体的实例化变量.\n"
          },
          {
            "title": "Instancing选项",
            "body": "对GPU Instancing进行一些设置.\n• #pragma instancing_options forcemaxcount:batchSize 强制设置单个批次内Instancing的最大数量,最大值和默认值是511.\n• #pragma instancing_options maxcount:batchSize 设置单个批次内Instancing的最大数量,仅Vulkan, Xbox One和Switch有效."
          }
        ]
      }
    ]
  },
  {
    "id": "macros",
    "label": "Predefined Macros(预定义宏)",
    "groups": [
      {
        "title": "Branch(流程控制)",
        "entries": [
          {
            "title": "#define UNITY_BRANCH        [branch]",
            "body": "添加在if语句上面,表示此语句会根据判断只执行符合条件的代码，有跳转指令."
          },
          {
            "title": "#define UNITY_FLATTEN       [flatten]",
            "body": "添加在if语句上面,表示此语句会执行全部代码,然后根据条件来选择某个具体的结果,没有跳转指令."
          },
          {
            "title": "#define UNITY_UNROLL        [unroll]",
            "body": "添加在for语句上面,表示此循环在编绎时会展开所有循环代码，以必竟for循环中的跳转指令,会产生较多的编绎代码."
          },
          {
            "title": "#define UNITY_UNROLLX(_x)   [unroll(_x)]",
            "body": "添加在for语句上面,功能同上，同时可以指定具体的展开次数."
          },
          {
            "title": "#define UNITY_LOOP          [loop]",
            "body": "添加在for语句上面,表示此循环不可展开，正常执行跳转."
          }
        ]
      },
      {
        "title": "TargetPlatform",
        "entries": [
          {
            "title": "SHADER_API_D3D11",
            "body": "Direct3D 11"
          },
          {
            "title": "SHADER_API_GLCORE",
            "body": "桌面OpenGL核心(GL3/4)"
          },
          {
            "title": "SHADER_API_GLES",
            "body": "OpenGl ES 2.0"
          },
          {
            "title": "SHADER_API_GLES3",
            "body": "OpenGl ES 3.0/3.1"
          },
          {
            "title": "SHADER_API_METAL",
            "body": "IOS/Mac Metal"
          },
          {
            "title": "SHADER_API_VULKAN",
            "body": "Vulkan"
          },
          {
            "title": "SHADER_API_D3D11_9X",
            "body": "IOS/Mac Metal"
          },
          {
            "title": "SHADER_API_PS4",
            "body": "PS4平台,SHADER_API_PSSL同时也会被定义"
          },
          {
            "title": "SHADER_API_XBOXONE",
            "body": "Xbox One"
          },
          {
            "title": "SHADER_API_MOBILE",
            "body": "所有移动平台(GLES/GLES3/METAL)"
          }
        ]
      },
      {
        "title": "Shader Target Model",
        "entries": [
          {
            "title": "#if SHADER_TARGET < 30",
            "body": "对应于#pragma target的值，2.0就是20，3.0就是30。"
          }
        ]
      },
      {
        "title": "Unity version",
        "entries": [
          {
            "title": "#if UNITY_VERSION >= 500",
            "body": "Unity版本号判断，500表示5.0.0"
          }
        ]
      },
      {
        "title": "Platform Difference Helpers",
        "entries": [
          {
            "title": "UNITY_UV_STARTS_AT_TOP",
            "body": "一般此判断当前平台是DX(UV原点在左上角)还是OpenGL(UV原点在左下角)"
          },
          {
            "title": "UNITY_NO_SCREENSPACE_SHADOWS",
            "body": "定义移动平台不进行Cascaded ScreenSpace Shadow."
          }
        ]
      },
      {
        "title": "UI",
        "entries": [
          {
            "title": "UNITY_UI_CLIP_RECT",
            "body": "当父级物体有Rect Mask 2D组件时激活.\n需要先手动定义此变体#pragma multi_compile _ UNITY_UI_CLIP_RECT\n同时需要声明：_ClipRect(一个四维向量，四个分量分别表示RectMask2D的左下角点的xy坐标与右上角点的xy坐标.)\nUnityGet2DClipping (float2 position, float4 clipRect)即可实现遮罩."
          }
        ]
      },
      {
        "title": "Lighting",
        "entries": [
          {
            "title": "UNITY_SHOULD_SAMPLE_SH",
            "body": "是否进行计算SH（光照探针与顶点着色）\n-当静态与动态Lightmap启用时，此项不激活.\n-当静态与动态Lightmap没有启用时，此项激活.\n-除ForwardBase其它Pass都不激活，每个Pass需要指定UNITY_PASS_FORWARDADD、UNITY_PASS_SHADOWCASTER等."
          },
          {
            "title": "UNITY_SAMPLE_FULL_SH_PER_PIXEL",
            "body": "光照贴图uv和来自SHL2的环境颜色在顶点和像素内插器中共享,在启用静态lightmap和LIGHTPROBE_SH时，在像素着色器中执行完整的SH计算。"
          },
          {
            "title": "HANDLE_SHADOWS_BLENDING_IN_GI",
            "body": "当同时定义了SHADOWS_SCREEN与LIGHTMAP_ON时开启."
          },
          {
            "title": "UNITY_SHADOW_COORDS(N)",
            "body": "定义一个float4类型的变量_ShadowCoord,语义为第N个TEXCOORD."
          },
          {
            "title": "V2F_SHADOW_CASTER;",
            "body": "用于\"LightMode\" = \"ShadowCaster\"中,相当于定义了float4 pos:SV_POSITION."
          }
        ]
      },
      {
        "title": "Other",
        "entries": [
          {
            "title": "UNITY_SHADER_NO_UPGRADE",
            "body": "令Shader不自动更新API,只需把语句用注释的形式写在shader中任意位置即可."
          },
          {
            "title": "UNITY_NO_DXT5nm",
            "body": "法线纹理是否不采用DXT5压缩,移动平台(在编缉器下切换到Android/IOS平台也可以)是，非移动平台否."
          },
          {
            "title": "UNITY_ASTC_NORMALMAP_ENCODING",
            "body": "当在移动平台(Android/IOS/TVOS)中,法线纹理采用类DXT5nm的压缩时启用，可通过PlayerSetting中设置NormalMapEncoding的方式."
          },
          {
            "title": "SHADERGRAPH_PREVIEW",
            "body": "在ShaderGraph中的Custom Function自义定节点上使用，用于判断是否处于SG面板预览中."
          }
        ]
      }
    ]
  },
  {
    "id": "platform",
    "label": "Platform Difference(平台差异)",
    "groups": [
      {
        "title": "裁剪空间(规范化立方体)",
        "entries": [
          {
            "title": "OpenGL",
            "body": "裁剪空间下坐标范围(-1,1)"
          },
          {
            "title": "DirectX",
            "body": "裁剪空间下坐标范围(1,0)"
          },
          {
            "title": "UNITY_NEAR_CLIP_VALUE",
            "body": "裁剪空间下的近剪裁值,(DX为1,OpenGL为-1)."
          }
        ]
      },
      {
        "title": "ReversedZ",
        "entries": [
          {
            "title": "Reversed direction(反向方向)",
            "body": "DirectX 11、DirectX 12、PS4、Xbox One、Metal这些平台都属于反向方向.\n深度值从近裁剪面到远裁剪面的值为[1 ~ 0]\n裁剪空间下的Z轴范围为[near,0]"
          },
          {
            "title": "Traditional direction(传统方向)",
            "body": "除以上反向方向的平台以外都属于传统方向.\n深度值从近裁剪面到远裁剪面的值为[0 ~ 1]\n裁剪空间下的Z轴范围为:\nDX平台=[0,far]\nOpenGL平台=[-near,far]"
          },
          {
            "title": "UNITY_REVERSED_Z",
            "body": "判断当前平台是否开启ReversedZ"
          },
          {
            "title": "SystemInfo.usesReversedZBuffer",
            "body": "利用C#判断当前平台是否支持ReversedZ"
          }
        ]
      }
    ]
  },
  {
    "id": "lighting",
    "label": "LightingMode(光照模型)",
    "groups": [
      {
        "title": "光照模型概念",
        "entries": [
          {
            "title": "光照模型:",
            "body": "有时也被称为着色模型(Shading Modle)，有时也使用术语反射模型(Reflection Model),进一步使术语复杂化。\n目前最常见的光照模型称为 ADS 模型,因此给予标记为A、D、S的三种类型反射。\nA:\t环境光反射(Ambient reflection)模型低级光照，影响场景中的所有物体。\nD:\t漫反射(Diffuse reflection)根据光线的入射角度调整物体的亮度。\nS:\t镜面反射(Specular reflection)用以暂时物体的光泽度，通过在物体表面上，光照最直接的反射到我们的眼睛的位置，策略性的放置适当大小的高光来实现。"
          }
        ]
      },
      {
        "title": "LightModel(光照模型)",
        "entries": [
          {
            "title": "Lambert",
            "body": "Diffuse = Ambient + Kd * LightColor * max(0,dot(N,L))\nDiffuse:\t最终物体上的漫反射光强。\nAmbient:\t环境光强度，为了简化计算，环境光强采用一个常数表示。\nKd:\t物体材质对光的反射系数。\nLightColor:\t光源的颜色。\nN:\t顶点的单位法线向量。\nL:\t顶点指向光源的单位向量。"
          },
          {
            "title": "Half-Lambert",
            "body": "Diffuse = Ambient + Kd * LightColor * (dot(N,L) * 0.5 + 0.5)\nDiffuse:\t最终物体上的漫反射光强。\nAmbient:\t环境光强度，为了简化计算，环境光强采用一个常数表示。\nKd:\t物体材质对光的反射系数。\nLightColor:\t光源的颜色。\nN:\t顶点的单位法线向量。\nL:\t顶点指向光源的单位向量。"
          },
          {
            "title": "Phong",
            "body": "Specular = SpecularColor * Ks * pow(max(0,dot(R,V)), Shininess)\nPhong模型属于高光模型，在像素阶段计算时被称为Phong，在顶点阶段计算时，被称为(Gouraud Lighting)。\nSpecular:\t最终物体上的反射高光光强.\nSpecularColor:\t反射光的颜色。\nKs:\t反射强度系数。\nR:\t反射向量，可使用2 * N * dot(N,L) - L或者reflect (-L,N)获得。\nV:\t观察方向。\nN:\t顶点的单位法线向量。\nL:\t顶点指向光源的单位向量。\nShininess:\t乘方运算来模拟高光的变化。"
          },
          {
            "title": "Blinn-Phong",
            "body": "Specular = SpecularColor * Ks * pow(max(0,dot(N,H)), Shininess)\n在像素着色器阶段计算。\nSpecular:\t最终物体上的反射高光光强.\nSpecularColor:\t反射光的颜色.\nKs:\t反射强度系数。\nN:\t顶点的单位法线向量。\nH:\t入射光线L与视线V的中间向量，也称为半角向量H = normalize(L+V)。\nShininess:\t乘方运算来模拟高光的变化。"
          },
          {
            "title": "BRDF",
            "body": "f(l,v) = diffuse + D(h)F(v,h)G(l,v,h)/4cos(n·l)cos(n·v)\nf(l,v):\t双向反射分布函数的最终值,l表示光的方向,v表示视线的方向。\ndiffuse:\t漫反射。\nD(h):\t法线分布函数(Normal Distribution Function),描述微面元法线分布的概率,即朝向正确的法线浓度.h为半角向量,表示光的方向与反射方向的半角向量,只有物体的微表面法向m = h时,才会反射到视线中.\nD(h) = roughness^2 / π((n·h)^2(roughness^2-1)+1)^2\nF(v,h):\t菲涅尔方程(Fresnel Equation),描述不同的表面角下表面所反射的光线所占的比率.\nF(v,h) = F0 + (1-F0)(1-(v·h))^5(F0是0度入射角的菲涅尔反射值)。\nG(l,v,h):\t几何函数(Geometry Function),描述微平面自成阴影的属性,即微表面法向m = h的并未被遮蔽的表面点的百分比。\n4cos(n·l)cos(n·v):\t校正因子(correctionfactor)作为微观几何的局部空间和整个宏观表面的局部空间之间变换的微平面量的校正。"
          },
          {
            "title": "Kajiya-Kay Model",
            "body": "常用的各向异性光照模型,该模型属于光照模型的高光部分。\nsin(T,H) = sqrt(1 - dot(T,H)^2)。\nsqrt:平方根公式。\nT：顶点的副切线方向，或者是法线贴图的副切线方向。\nH：半角向量，halfDir = normalize(worldLightDir + worldViewDir);"
          }
        ]
      },
      {
        "title": "Normal(NormalMap)",
        "entries": [
          {
            "title": "切线空间法线变换到世界空间：\n1.Attributes中定义NORMAL与TANGENT语义.\n   float3 normalOS     : NORMAL;\n   float4 tangentOS    : TANGENT;\n2.Varyings中声明三个变量用于组成成切线空间下的旋转矩阵.\n   half4 normalWS      :TEXCOORD3;\n   half4 tangentWS     :TEXCOORD4;\n   half4 bitangentWS   :TEXCOORD5;\n3.在顶点着色器中执行:\n   方法一：\n   o.normalWS.xyz = TransformObjectToWorldNormal(v.normalOS);\n   o.tangentWS.xyz = TransformObjectToWorldDir(v.tangentOS.xyz);\n   half sign = v.tangentOS.w * GetOddNegativeScale();\n   o.bitangentWS.xyz = cross(o.normalWS, o.tangentWS) * sign;\n   方法二\n   VertexNormalInputs normalInput = GetVertexNormalInputs(v.normalOS,v.tangentOS);\n   o.tangentWS = normalInput.tangentWS;\n   o.bitangentWS = normalInput.bitangentWS;\n   o.normalWS = normalInput.normalWS;\n4.在片断着色器中计算出世界空间下的法线,然后再拿去进行需要的计算:\n   方法一：\n   half3 normalMapTS = UnpackNormalScale(SAMPLE_TEXTURE2D(_NormalMap, sampler_NormalMap, i.uv),scale);\n   half3 normalWS = mul(normalMap,half3x3(i.tangentWS.xyz, i.bitangentWS.xyz, i.normalWS.xyz));\n   方法二：\n   float3x3 TBN = float3x3(i.tangentWS,i.bitangentWS,i.normalWS);\n   half3 normalMapTS = UnpackNormalScale(SAMPLE_TEXTURE2D(_NormalMap, sampler_NormalMap, i.uv),scale);\n   float3 normalWS = TransformTangentToWorld(normalTS , TBN);",
            "body": ""
          },
          {
            "title": "法线混合",
            "body": "方法一：\nreturn normalize(float3(A.rg + B.rg, A.b * B.b));\n方法二：\nfloat3 t = A.xyz + float3(0.0, 0.0, 1.0);\nfloat3 u = B.xyz * float3(-1.0, -1.0, 1.0);\nfloat3 r = (t / t.z) * dot(t, u) - u;\nreturn r;"
          }
        ]
      },
      {
        "title": "获取主方向光",
        "entries": [
          {
            "title": "Light light = GetMainLight(shadowCoord);",
            "body": "获取主平行灯相关参数:\nlight.direction : 主平行灯的方向(_MainLightPosition.xyz),已归一化.\nlight.color : 主平行灯的颜色(_MainLightColor.rgb).\nlight.shadowAttenuation : 在此函数下为1(half)."
          }
        ]
      },
      {
        "title": "获取额外光源",
        "entries": [
          {
            "title": "是否额外的灯启用.",
            "body": "#ifdef _ADDITIONAL_LIGHTS\nuint AdditionalLightCount = GetAdditionalLightsCount();\nfor (uint lightIndex = 0; lightIndex < AdditionalLightCount; ++lightIndex)\n{\n   Light light = GetAdditionalLight(lightIndex, i.posWorld.xyz);\n   half3 attenuatedLightColor = light.color * (light.distanceAttenuation * light.shadowAttenuation);\n   lightColor += LightingLambert(attenuatedLightColor, light.direction, normalDirection);\n}\n#endif"
          },
          {
            "title": "_ADDITIONAL_LIGHTS_VERTEX",
            "body": "额外的灯是否采用逐顶点照明."
          }
        ]
      },
      {
        "title": "投射阴影",
        "entries": [
          {
            "title": "ShadowCaster",
            "body": "添加LightMode = ShadowCaster的pass即可渲染进lightmap产生投影.\nUsePass \"Universal Render Pipeline/Lit/SHADOWCASTER\""
          }
        ]
      },
      {
        "title": "ReceiveShadow(接收阴影)",
        "entries": [
          {
            "title": "_MAIN_LIGHT_SHADOWS",
            "body": "是否开启主灯的阴影(管线设置中主灯的Cast Shadows是否开启)"
          },
          {
            "title": "MAIN_LIGHT_CALCULATE_SHADOWS",
            "body": "当管线上设置了主灯投影，并且当前对象也没有激活_RECEIVE_SHADOWS_OFF时开启"
          },
          {
            "title": "_MAIN_LIGHT_SHADOWS_CASCADE",
            "body": "是否开启主灯的级联阴影(当管线设置中Shadows>Cascades为No Cascades时不激活，否则激活)"
          },
          {
            "title": "REQUIRES_VERTEX_SHADOW_COORD_INTERPOLATOR",
            "body": "当开启主灯阴影但是没有开启级联阴影时，则激活"
          },
          {
            "title": "_MainLightShadowmapSize",
            "body": "ShadowMap的尺寸\nx=1/width y=1/height z=width w=height"
          },
          {
            "title": "_MainLightShadowParams",
            "body": "Shadow的参数\nx=ShadowStrength(阴影强度) y=(1为软阴影,0为硬阴影)"
          },
          {
            "title": "_SHADOWS_SOFT",
            "body": "管线上Shadows中是否开启软阴影(Soft Shadows)"
          }
        ]
      },
      {
        "title": "Fog(雾)",
        "entries": [
          {
            "title": "unity_FogColor",
            "body": "内置雾效颜色值"
          },
          {
            "title": "实现方法",
            "body": "#pragma multi_compile_fog\nfloat fogCoord  : TEXCOORD1;\t//在Varyings中定义fogCoord\no.fogCoord = ComputeFogFactor(o.positionCS.z);\t//在顶点着色器中添加\nFinalColor.rgb = MixFog(c.rgb, i.fogCoord);\t//在片断着色器中添加"
          },
          {
            "title": "Linear",
            "body": "线性雾公式:(end-z)/(end-start)"
          },
          {
            "title": "EXP",
            "body": "指数雾公式:exp(-density*z)"
          },
          {
            "title": "EXP2",
            "body": "指数2次方雾公式:exp(-(density*z)^2)"
          }
        ]
      },
      {
        "title": "Light Bake(光照烘培)",
        "entries": [
          {
            "title": "LIGHTMAP_ON",
            "body": "是否开启光照烘焙\n1.Lighting界面中的Baked Global Illumination勾选\n2.场景烘焙，或者勾选自动烘焙\n3.模型勾选Static中的Contribute GI"
          },
          {
            "title": "_MIXED_LIGHTING_SUBTRACTIVE",
            "body": "\n1.Lighting界面中的Baked Global Illumination勾选\n2.Lighting Mode设置为Subtractive模式\n3.场景烘焙，或者勾选自动烘焙\n4.模型勾选Static中的Contribute GI\n5.灯光必须设置为Mixed模式"
          }
        ]
      },
      {
        "title": "环境色",
        "entries": [
          {
            "title": "1.half3 vertexSH : TEXCOORD?    在v2f中声明\n2.o.vertexSH = SampleSHVertex(世界空间法线);    在顶点着色器中调用\n3.half3 sh = SampleSHPixel(i.vertexSH, 世界空间法线);    在片断着色器中调用",
            "body": ""
          }
        ]
      }
    ]
  },
  {
    "id": "texture",
    "label": "TextureSampler(纹理采样)",
    "groups": [
      {
        "title": "TextureSampler(纹理采样)",
        "entries": [
          {
            "title": "TEXTURE2D (textureName);",
            "body": "二维纹理的定义(纹理与采样器分离定义),此功能在OpenGL ES2.0上不支持，会使用原来sampler2D的形式.\ntextureName:Properties中声明的2D纹理名称."
          },
          {
            "title": "TEXTURECUBE (textureName);",
            "body": "立方体纹理的定义(纹理与采样器分离定义),此功能在OpenGL ES2.0上不支持，会使用原来samplerCube的形式.\ntextureName:Properties中声明的立方体纹理名称."
          },
          {
            "title": "SAMPLER(samplerName);",
            "body": "采样器的定义(纹理与采样器分离定义),采样器是指纹理的过滤模式与重复模式,此功能在OpenGL ES2.0上不支持，相当于没写.\n1.SAMPLER(sampler_textureName):sampler+纹理名称，这种定义形式是表示采用textureName这个纹理Inspector面板中的采样方式.\n2.SAMPLER(_filter_wrap):比如SAMPLER(sampler_linear_repeat),使用自定义的采样器设置，自定义的采样器一定要同时包含过滤模式<filter>与重复模式<wrap>的设置，注意这种自定义写法很多移动平台不支持！.\n3.SAMPLER(_filter_wrapU_wrapV):比如SAMPLER(sampler_linear_clampU_mirrorV),可同时设置重复模式的U与V的不同值.\n4.filter:point/linear/triLinear\n5.wrap:clamp/repeat/mirror/mirrorOnce"
          },
          {
            "title": "float4 [textureName]_ST;",
            "body": "获取纹理的Tiling(.xy)和Offset(.zw)"
          },
          {
            "title": "float4 [textureName]_TexelSize;",
            "body": "获取纹理的宽高分之一(.xy)和宽高(.zw)"
          },
          {
            "title": "SAMPLE_TEXTURE2D(textureName, samplerName, coord);",
            "body": "进行二维纹理采样操作\ntextureName:Properties中声明的2D纹理名称\nsamplerName:此纹理所使用的采样器设置\ncoord:采样用的UV"
          },
          {
            "title": "SAMPLE_TEXTURE2D_LOD(textureName, samplerName, coord,lod);",
            "body": "进行二维纹理采样操作\ntextureName:Properties中声明的2D纹理名称\nsamplerName:此纹理所使用的采样器设置\ncoord:采样用的UV\nlod:mipmap级别"
          },
          {
            "title": "SAMPLE_TEXTURE2D_BIAS(textureName, samplerName, coord,bias);",
            "body": "对mipmap进行偏移后再采样纹理\ntextureName:Properties中声明的2D纹理名称\nsamplerName:此纹理所使用的采样器设置\ncoord:采样用的UV\nbias:mipmap偏移量,比如0=默认,-1=比当前级别更清晰一级,1=比当前级别更模糊一级."
          },
          {
            "title": "SAMPLE_TEXTURECUBE(textureName, samplerName, coord);",
            "body": "进行立方体纹理采样操作\ntextureName:Properties中声明的CUBE纹理名称\nsamplerName:此纹理所使用的采样器设置\ncoord:采样用的UV"
          },
          {
            "title": "SAMPLE_TEXTURECUBE_LOD(textureName, samplerName, coord,lod);",
            "body": "进行立方体纹理采样操作\ntextureName:Properties中声明的CUBE纹理名称\nsamplerName:此纹理所使用的采样器设置\ncoord:采样用的UV\nlod:mipmap级别"
          },
          {
            "title": "SAMPLE_TEXTURE3D(textureName, samplerName, coord);",
            "body": "进行3D纹理采样操作\ntextureName:Properties中声明的3D纹理名称\nsamplerName:此纹理所使用的采样器设置\ncoord:采样用的三给UV"
          }
        ]
      },
      {
        "title": "TextureArray(纹理数组采样)",
        "entries": [
          {
            "title": "TEXTURE2D_ARRAY(textureName);",
            "body": "纹理数组的定义,此功能在OpenGL ES2.0上不支持，会fallback到samplerCUBE的形式."
          },
          {
            "title": "SAMPLER(sampler_samplerName);",
            "body": "纹理数组的采样器定义."
          },
          {
            "title": "SAMPLE_TEXTURE2D_ARRAY(textureName, samplerName, coord2, index);",
            "body": "纹理数组采样.\ntextureName:Properties中声明的2D纹理名称\nsamplerName:此纹理所使用的采样器设置\ncoord:采样用的UV\nindex:数组索引"
          }
        ]
      }
    ]
  },
  {
    "id": "algorithm",
    "label": "Algorithm(常用算法)",
    "groups": [
      {
        "title": "Vertex(顶点)",
        "entries": [
          {
            "title": "模型中心点坐标",
            "body": "方法1: float3 objCenterPos = mul( unity_ObjectToWorld, float4( 0, 0, 0, 1 ) ).xyz;\n方法2: float3 objCenterPos = float3(UNITY_MATRIX_M[0][3], UNITY_MATRIX_M[1][3], UNITY_MATRIX_M[2][3]);\n方法3: float3 center = float3(unity_ObjectToWorld[0].w, unity_ObjectToWorld[1].w, unity_ObjectToWorld[2].w);\n方法4: float3 center = float3(unity_ObjectToWorld._m03, unity_ObjectToWorld._m13, unity_ObjectToWorld._m23);\n方法5: float3 center = unity_ObjectToWorld._14_24_34;\n在Shader中获取当前模型中心点在世界空间下的坐标位置,整体缩放时uv会整体缩放，如果需要做某一个平面缩放，则需要重组UV坐标。"
          },
          {
            "title": "获取模型的旋转角度(Y轴)",
            "body": "float cosA = unity_ObjectToWorld._11;\nfloat sinA = unity_ObjectToWorld._13;\nfloat angle = atan2(sinA, cosA);\nangle *= 180 / 3.1415926;\nif (angle < 0) angle += 360;"
          },
          {
            "title": "BillBoard",
            "body": "在Properties中添加:\n[Enum(BillBoard,1,VerticalBillboard,0)]BillBoardType(\"BillBoard Type\",float) = 1\n\n在顶点着色器中添加:\n//将相机从世界空间转换到模型的本地空间中,而这个转换后的相机坐标即是点也是模型中心点(0,0,0)到相机的方向向量，如果按照相机空间来定义的话，可以把这个向量定义为相机空间下的Z值\nfloat3  cameraOS_Z = mul(unity_WorldToObject, float4(_WorldSpaceCameraPos, 1));\n//BillBoardType=0时,圆柱形BillBoard;BillBoard=1时,圆形BillBoard;\ncameraOS_Z.y = cameraOS_Z.y * BillBoardType;\n//归一化，使其为长度不变模为1的向量\ncameraOS_Z = normalize(cameraOS_Z);\n//假设相机空间下的Y轴向量为(0,1,0)\ncameraOS_Y = float3(0,1,0);\n//利用叉积求出相机空间下的X轴向量\nfloat3 cameraOS_X = normalize(cross(cameraOS_Z,cameraOS_Y));\n//再次利用叉积求出相机空间下的Y轴向量\ncameraOS_Y = cross(cameraOS_X,cameraOS_Z);\n//通过向量与常数相乘来把顶点的X轴与Y对应到cameraOS的X与Y轴向上\nfloat3 billboardPositionOS = cameraOS_X * v.vertex.x + cameraOS_Y * v.vertex.y;\no.pos = UnityObjectToClipPos(billboardPositionOS);"
          },
          {
            "title": "网格阴影",
            "body": "half4 worldPos = mul(unity_ObjectToWorld, v.vertex);\nworldPos.y = 2.47;\nworldPos.xz += fixed2(阴影X方向,阴影Z方向)*v.vertex.y;\no.pos = mul(UNITY_MATRIX_VP,worldPos);"
          }
        ]
      },
      {
        "title": "UV变换",
        "entries": [
          {
            "title": "UV重映射到中心位置",
            "body": "float2 centerUV = uv * 2 - 1\n将UV值重映射为(-1,-1)~(1,1)，也就是将UV的中心点从左下角移动到中间位置。"
          },
          {
            "title": "从中心缩放纹理",
            "body": "half2 offset = (0.5-i.uv.xy)*_Offset;\nhalf4 baseMap = SAMPLE_TEXTURE2D(_MainTex, sampler_MainTex, i.uv.xy + offset);"
          },
          {
            "title": "旋转",
            "body": "float t=_Time.y;\nfloat2 rot= cos(t)*i.uv+sin(t)*float2(i.uv.y,-i.uv.x);"
          },
          {
            "title": "极坐标",
            "body": "float2 centerUV = (i.uv * 2 - 1);\nfloat atan2UV = 1 - abs(atan2(centerUV.g, centerUV.r) / 3.14);\n利用UV来实现极坐标."
          }
        ]
      },
      {
        "title": "UV图形",
        "entries": [
          {
            "title": "画圆",
            "body": "float circle = smoothstep(_Radius, (_Radius + _CircleFade), length(uv * 2 - 1));\n利用UV来画圆，通过_Radius来调节大小，_CircleFade来调节边缘虚化程序。"
          },
          {
            "title": "画矩形",
            "body": "float2 centerUV = abs(i.uv.xy * 2 - 1);\nfloat rectangleX = smoothstep(_Width, (_Width + _RectangleFade), centerUV.x);\nfloat rectangleY = smoothstep(_Heigth, (_Heigth + _RectangleFade), centerUV.y);\nfloat rectangleClamp = clamp((rectangleX + rectangleY), 0.0, 1.0);\n利用UV来画矩形，_Width调节宽度，_Height调节高度，_RectangleFade调节边缘虚化度。"
          },
          {
            "title": "黑白棋盘格",
            "body": "float2 uv = i.uv * 格子密度;\nuv = floor(uv) * 0.5;\nfloat c = frac(uv.x + uv.y) * 2;\nreturn c;"
          },
          {
            "title": "蜂窝格",
            "body": "float2 uv = i.uv * 格子密度;\nuv.y += floor(uv.x) * 0.5;\nuv = fmod(uv,1);\nuv = uv*2-1;\nuv = abs(uv);\nfloat d = max((uv.x*0.9+uv.y*0.5),uv.y);\nd = step(d,_Size);\nreturn d;"
          },
          {
            "title": "将0-1的值控制在某个自定义的区间内",
            "body": "frac(x*n+n);\n比如frac(i.uv*3.33+3.33);就是将0-1的uv值重新定义为0.33-0.66"
          },
          {
            "title": "随机",
            "body": "1.float2 uv = floor(i.uv.xy*24);\n2.frac(sin(dot(uv, float2(12.9898, 78.233))) * 43758.5453);\n或者:frac(sin(x)*n);"
          },
          {
            "title": "序列图",
            "body": "splitUV是把原有的UV重新定位到左上角的第一格UV上，_Sequence.xy表示的是纹理是由几x几的格子组成的,_Sequence.z表示的是走序列的快慢.\nfloat2 splitUV = uv * (1/_Sequence.xy) + float2(0,_Sequence.y - 1/_Sequence.y);\nfloat time = _Time.y * _Sequence.z;\nuv = splitUV + float2(floor(time *_Sequence.x)/_Sequence.x,1-floor(time)/_Sequence.y);"
          }
        ]
      },
      {
        "title": "Color(颜色)",
        "entries": [
          {
            "title": "去色",
            "body": "方法1：Luminance(float rgb)\n方法2：dot(rgb,fixed3(0.22,0.707,0.071))\n方法3：dot(rgb,half3(0.299,0.587,0.114))\n方法4：(r+g+b)/3"
          },
          {
            "title": "RGB2HSV方法",
            "body": "half3 RGB2HSV(half3 c)\n{\n\thalf4 K = half4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);\n\thalf4 p = lerp(half4(c.bg, K.wz), half4(c.gb, K.xy), step(c.b, c.g));\n\thalf4 q = lerp(half4(p.xyw, c.r), half4(c.r, p.yzx), step(p.x, c.r));\n\thalf d = q.x - min(q.w, q.y);\n\thalf e = 1.0e-10;\n\treturn half3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);\n}"
          },
          {
            "title": "HSV2RGB方法",
            "body": "half3 HSV2RGB (half3 c)\n{\n\tfloat4 K = float4 (1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\n\tfloat3 p = abs (frac (c.xxx + K.xyz) * 6.0 - K.www);\n\treturn c.z * lerp (K.xxx, saturate (p - K.xxx), c.y);\n}"
          },
          {
            "title": "利用HSV对颜色进行调整",
            "body": "half3 hsv = RGB2HSV(baseMap.rgb);\nbaseMap.rgb = HSV2RGB(float3((hsv.x + _HSVValue.x), (hsv.y * _HSVValue.y), (hsv.z * _HSVValue.z)));"
          }
        ]
      },
      {
        "title": "Light(光照)",
        "entries": [
          {
            "title": "MatCap",
            "body": "顶点着色器阶段:将模型法线从本地空间转换到世界空间\nhalf3 normalWS = TransformObjectToWorldNormal(v.normalOS);\n将模型的法线从世界空间转换到试图空间，并进行区域限制。\nviewSpace空间下的法线区域是[-1,1]，而uv的区域是[0，1],因此需要进行一个x *0.5+0.5的操作。\n●方法一:使用内置的函数进行空间变换\no.normalVS = TransformWorldToViewDir(normalWS) * 0.5 + 0.5;\n●方法二:使用内置矩阵手动进行空间变换\no.normalVS = mul(UNITY_MATRIX_V, float4(o.normalWS, 0.0)).xy * 0.5 + 0.5;\n\n片段着色器阶段:采样MatCapTexture\nhalf4 matCapTexture = SAMPLE_TEXTURE2D(_MatCapTexture,sampler_MatCapTexture , i.normalVS.xy);"
          }
        ]
      },
      {
        "title": "Other(其它)",
        "entries": [
          {
            "title": "Fresnel(菲涅尔)",
            "body": " half3 rimColor = half4 (0, 0.4, 1, 1);\n half3 worldViewDir = normalize (UnityWorldSpaceViewDir (i.worldPos));\n float  ndotv = dot (i.normal, worldViewDir);\n float  fresnel = (0.2 + 2.0 * pow (1.0 - ndotv, 2.0));\n half4 FinalColor = rimColor * fresnel;"
          },
          {
            "title": "X-Ray(射线)",
            "body": "1. 新建一个Pass\n2.设置自己想要的Blend\n3.Zwrite Off关闭深度写入\n4.Ztest greater深度测试设置为大于 "
          },
          {
            "title": "Dither(抖动)",
            "body": "//先求出整数型的屏幕像素UV(求余后)\nfloat2 uv = (uint2)i.positionCS.xy%行数;\n//然后调用相应的方法\nfloat Dither2x2(float2 uv)\n{\n   float D[4] =\n   {\n       0,2,\n       3,1\n   };\n   uint index = uv.x * 2 + uv.y;\n   return D[index] / 5;\n}\n\nfloat Dither4x4(float2 uv)\n{\n   float D[16] =\n   {\n       0,8,2,10,\n       12,4,14,6,\n       3,11,1,9,\n       15,7,13,5\n   };\n   uint index = uv.x * 4 + uv.y;\n   return D[index] / 17;\n}\n\nfloat Dither8x8(float2 uv)\n{\n   float D[64] =\n   {\n       0,32,8,40,2,34,10,42,\n       48,16,56,24,50,18,58,26,\n       12,44,4,36,14,46,6,38,\n       60,28,52,20,62,30,54,22,\n       3,35,11,43,1,33,9,41,\n       51,19,59,27,49,17,57,25,\n       15,47,7,39,13,45,5,37,\n       63,31,55,23,61,29,53,21\n   };\n   uint index = uv.x * 8 + uv.y;\n   return D[index] / 65;\n}\n"
          }
        ]
      }
    ]
  },
  {
    "id": "color-blend",
    "label": "ColorBlendMode(颜色混合)",
    "groups": [
      {
        "title": "PS中的混合公式(A、B为图层)",
        "entries": [
          {
            "title": "正常",
            "body": "A*(1-B.a)+B*(B.a)"
          },
          {
            "title": "变暗",
            "body": "min(A,B)"
          },
          {
            "title": "变亮",
            "body": "max(A,B)"
          },
          {
            "title": "正片叠底",
            "body": "A*B"
          },
          {
            "title": "滤色",
            "body": "1-((1-A)*(1-B))"
          },
          {
            "title": "颜色加深",
            "body": "A-((1-A)*(1-B))/B"
          },
          {
            "title": "颜色减淡",
            "body": "A+(A*B)/(1-B)"
          },
          {
            "title": "线性加深",
            "body": "A+B-1"
          },
          {
            "title": "线性减淡",
            "body": "A+B"
          },
          {
            "title": "叠加",
            "body": "half4 a = step(A,0.5);\nhalf4 c = a*A*B*2+(1-a)*(1-(1-A)*(1-B)*2);"
          },
          {
            "title": "强光",
            "body": "half4 a = step(B,0.5);\nhalf4 c =a*A*B*2+(1-a)*(1-(1-A)*(1-B)*2);"
          },
          {
            "title": "柔光",
            "body": "half4 a = step(B,0.5);\nhalf4 c =a*(A*B*2+A*A*(1-B*2))+(1-a)*(A*(1-B)*2+sqrt(A)*(2*B-1)"
          },
          {
            "title": "亮光",
            "body": "half4 a = step(B,0.5);\nhalf4 c =a*(A-(1-A)*(1-2*B)/(2*B))+(1-a)*(A+A*(2*B-1)/(2*(1-B)));"
          },
          {
            "title": "点光",
            "body": "half4 a = step(B,0.5);\nhalf4 c =a*(min(A,2*B))+(1-a)*(max(A,( B*2-1)));"
          },
          {
            "title": "线性光",
            "body": "A+2*B-1"
          },
          {
            "title": "排除",
            "body": "A+B-A*B*2"
          },
          {
            "title": "差值",
            "body": "abs(A-B)"
          },
          {
            "title": "深色",
            "body": "half4 a = step(B.r+B.g+B.b,A.r+A.g+A.b);\nhalf4 c =a*(B)+(1-a)*(A);"
          },
          {
            "title": "浅色",
            "body": "half4 a = step(B.r+B.g+B.b,A.r+A.g+A.b);\nhalf4 c =a*(A)+(1-a)*(B);"
          },
          {
            "title": "减去",
            "body": "A-B"
          },
          {
            "title": "划分",
            "body": "A/B"
          }
        ]
      }
    ]
  },
  {
    "id": "math",
    "label": "MathFunction(数学函数)",
    "groups": [
      {
        "title": "Math(数学函数)",
        "entries": [
          {
            "title": "abs (x)",
            "body": "取绝对值，即正值返回正值，负值返回的还是正值,x值也可以为向量\nfloat abs(float a)\n{\n    return max(-a, a);\n}"
          },
          {
            "title": "acos (x)",
            "body": "反余弦函数,输入参数范围为[-1, 1],返回[0, π] 区间的弧度值"
          },
          {
            "title": "all (a)",
            "body": "当a或a的所有分量都为true或者非0时返回1(true),否则返回0(false).\nbool all(bool4 a)\n{\n    return a.x && a.y && a.z && a.w;\n}"
          },
          {
            "title": "any (a)",
            "body": "如果a=0或者a中的所有分量为0，则返回0(false);否则返回1(true).\nbool any(bool4 a)\n{\n    return a.x || a.y || a.z || a.w;\n}"
          },
          {
            "title": "asin (x)",
            "body": "返回x的反正弦值,范围为(-π/2,π/2)"
          },
          {
            "title": "atan2 (y,x)",
            "body": "返回y/x的反正切值"
          },
          {
            "title": "atan (x)",
            "body": "返回x的反正切值,范围为(-π/2,π/2),表示弧度"
          },
          {
            "title": "ceil (x)",
            "body": "对x进行向上取整，即x=0.1返回1，x=1.5返回2，x=-0.3返回0\nfloat ceil(float x)\n{\n    return -floor(-x);\n}"
          },
          {
            "title": "clamp(x,a,b)",
            "body": "如果x值小于a，则返回a;如果x值大于b,返回b;否则返回x.\nfloat clamp(float x, float a, float b)\n{\n    return max(a, min(b, x));\n}"
          },
          {
            "title": "clip (x)",
            "body": "如果x<0则裁剪掉此片断\nvoid clip(float4 x)\n{\n    if (any(x < 0))\n    discard;\n}"
          },
          {
            "title": "cos(x)",
            "body": "返回弧度x的余弦值,范围在[-1,1]之间.\n"
          },
          {
            "title": "cosh(x)",
            "body": "双曲余弦函数\nfloat cosh(float x)\n{\n    return 0.5 * (exp(x) + exp(-x));\n}"
          },
          {
            "title": "cross(a,b)",
            "body": "返回两个三维向量a与b的叉积\nfloat3 cross(float3 a, float3 b)\n{\n    return a.yzx * b.zxy - a.zxy * b.yzx;\n}"
          },
          {
            "title": "ddx(v)",
            "body": "当前像素右边的v值-当前像素的v值(水平方向的差值),假如v是坐标,那就是求坐标差"
          },
          {
            "title": "ddy(v)",
            "body": "当前像素下边的v值-当前像素的v值(垂直方向的差值)"
          },
          {
            "title": "degrees(x)",
            "body": "将x从弧度转换成角度\nfloat degrees(float x)\n{\n    return 57.29577951 * x;\n}\n角度=180/π*弧度\n弧度=π/180*角度"
          },
          {
            "title": "determinant(M)",
            "body": "返回方阵M的行列式,注意只有方阵才有行列式"
          },
          {
            "title": "dot(a,b)",
            "body": "点乘，a和b可以为标量也可以为向量,其计算结果是两个向量夹角的余弦值，相当于|a|*|b|*cos(θ)或者a.x*b.x+a.y*b.y+a.z*b.z\na和b的位置无所谓前后，结果都是一样的"
          },
          {
            "title": "distance(a,b)",
            "body": "返回a,b间的距离.\nfloat distance(a, b)\n{\n    float3 v = b - a;\n    return sqrt(dot(v, v));\n}"
          },
          {
            "title": "exp(x)",
            "body": "计算e的x次方，e = 2.71828182845904523536"
          },
          {
            "title": "exp2(x)",
            "body": "计算2的x次方"
          },
          {
            "title": "floor(x)",
            "body": "对x值进行向下取整(去尾求整)\n比如:floor (0.6) = 0.0,floor (-0.6) = -1.0"
          },
          {
            "title": "fmod(x,y)",
            "body": "返回x/y的余数。如果y为0，结果不可预料,注意！如果x为负值，返回的结果也是负值！\nfloat fmod(float a, float b)\n{\n    float c = frac(abs(a / b)) * abs(b);\n    return (a < 0) ? -c : c;   /* if ( a < 0 ) c = 0-c */\n}"
          },
          {
            "title": "frac (x)",
            "body": "返回x的小数部分\nfloat frac(float x)\n{\n    return x - floor(x);\n}"
          },
          {
            "title": "fwidth(v)",
            "body": "当前像素与它右边及下边像素的差值,abs( ddx(v) )+ abs(ddy(v))"
          },
          {
            "title": "length (v)",
            "body": "返回一个向量的模，即 sqrt(dot(v,v))"
          },
          {
            "title": "lerp (A,B,alpha)",
            "body": "线性插值.\n如果alpha=0，则返回A;\n如果alpha=1，则返回B;\n否则返回A与B的混合值;内部执行:A + alpha*(B-A)\nfloat3 lerp(float3 A, float3 B, float alpha)\n{\n    return A + alpha*(B-A);\n}"
          },
          {
            "title": "log(x)",
            "body": "返回x的自然对数,如果a^x = N（a>0，且a≠1），那么x就叫做以a为底N的对数."
          },
          {
            "title": "log2(x)",
            "body": "返回以2为底的自然对数"
          },
          {
            "title": "log10(x)",
            "body": "返回以10为底的自然对数"
          },
          {
            "title": "max(a,b)",
            "body": "比较两个标量或等长向量元素，返回最大值"
          },
          {
            "title": "min(a,b)",
            "body": "比较两个标量或等长向量元素，返回最小值"
          },
          {
            "title": "mul",
            "body": "mul(M,v):矩阵M与列向量v相乘，结果就是对向量v进行矩阵M变换后的值,相当于mul(v,transpose(M)).\nmul(v,M):行向量v与矩阵M相乘，结果就是对向量v进行矩阵M变换后的值,相当于mul(transpose(M),v)."
          },
          {
            "title": "normalize(v)",
            "body": "返回一个向量的归一化版本(方向一样，但是模为1)\nnormalize(v) = rsqrt(dot(v,v))*v; rsqrt返回的是平方根的倒数"
          },
          {
            "title": "pow(x,y)",
            "body": "返回x的y次方\nfloat pow(float x, float y)\n{\n   exp(x * log(y));\n}"
          },
          {
            "title": "PositivePow(x,y)",
            "body": "同pow()，但是避免了报错的警告信息."
          },
          {
            "title": "rcp(x)",
            "body": "返回x的倒数,相当于 1/x"
          },
          {
            "title": "reflect(I, N)",
            "body": "根据入射光方向向量 I ，和顶点法向量 N ，计算反射光方向向量。其中 I 和 N 必须被归一化，需要非常注意的是，这个 I 是指向顶点的；函数只对三元向量有效。\n\nfloat3 reflect( float3 i, float3 n )\n{\n   return i - 2.0 * n * dot(n,i);\n}"
          },
          {
            "title": "refract(I,N,eta)",
            "body": "计算折射向量， I 为入射光线， N 为法向量， eta 为折射系数；其中 I 和 N 必须被归一化，如果 I 和 N 之间的夹角太大，则返回（ 0 ， 0 ， 0 ），也就是没有折射光线； I 是指向顶点的；函数只对三元向量有效。\n\nfloat3 refract( float3 i, float3 n, float eta )\n{\n   float cosi = dot(-i, n);\n   float cost2 = 1.0f - eta * eta * (1.0f - cosi*cosi);\n   float3 t = eta*i + ((eta*cosi - sqrt(abs(cost2))) * n);\n   return t * (float3)(cost2 > 0);\n}"
          },
          {
            "title": "round(x)",
            "body": "返回x四舍五入的值"
          },
          {
            "title": "rsqrt(x)",
            "body": "返回x的平方根倒数,注意x不能为0.相当于 pow(x, -0.5)"
          },
          {
            "title": "saturate (x)",
            "body": "如果x<0返回0,如果x>1返回1,否则返回x."
          },
          {
            "title": "sqrt(x)",
            "body": "返回x的平方根."
          },
          {
            "title": "step(a,b)",
            "body": "如果a<=b返回1,否则返回0."
          },
          {
            "title": "sign(x)",
            "body": "如果x=0返回0,如果x>0返回1,如果x<0返回-1."
          },
          {
            "title": "sin(x)",
            "body": "返回弧度x的正弦值,范围在[-1,1]之间.\n"
          },
          {
            "title": "sincos(x,a,b)",
            "body": "同时返回弧度x的正弦值a与余弦值b.\n"
          },
          {
            "title": "smoothstep (min,max,x)",
            "body": "float smoothstep (float min, float max, float x)\n{\n\tfloat t = saturate ((x - min) / (max - min));\n\treturn t * t * (3.0 - (2.0 * t));\n}\n如果 x 比min 小，返回 0\n如果 x 比max 大，返回 1\n如果 x 处于范围 [min，max]中，则返回 0 和 1 之间的值(按值在min和max间的比例).\n如果只想要线性过渡，并不需要平滑的话，可以直接使用saturate((x - min)/(max - min))"
          },
          {
            "title": "tan(x)",
            "body": "返回x的正切值"
          },
          {
            "title": "transpose (M)",
            "body": "求矩阵M的转置."
          }
        ]
      }
    ]
  },
  {
    "id": "substance",
    "label": "SubstancePainter",
    "groups": [
      {
        "title": "参考网址",
        "entries": [
          {
            "title": "URL:\n",
            "body": "https://helpx.adobe.com/substance-3d-painter/home.html"
          }
        ]
      },
      {
        "title": "材质参数",
        "entries": [
          {
            "title": "颜色(RGB)",
            "body": "//: param custom {\"default\":[1,0.9568,0.8392],\"label\":\"灯光颜色(RGB)\",\"widget\":\"color\",\"group\":\"灯光\",\"description\":\"tooltip在这里\"}\nuniform vec3 _LightColor;\nuniform vec4 _BaseColor;(当为4维颜色时,alpha会变成滑条)"
          },
          {
            "title": "整型",
            "body": "//: param custom { \"default\": 0, \"label\": \"Int\",\"min\": 0, \"max\": 10,\"step\": 1,\"group\":\"Int\" }\nuniform int u_int1;\nuniform ivec2 u_int2;\nuniform ivec3 u_int3;\nuniform ivec4 u_int4;"
          },
          {
            "title": "浮点值",
            "body": "//: param custom { \"default\": 1, \"label\": \"Float\", \"min\": 0, \"max\": 2,\"step\": 0.1,\"group\":\"Float\" }\nuniform float u_float1;\nuniform vec2 u_float2;\nuniform vec3 u_float3;\nuniform vec4 u_float4;"
          },
          {
            "title": "开关",
            "body": "//: param custom { \"default\": false, \"label\": \"Boolean\",\"group\":\"Toogle\" }\nuniform bool u_bool;"
          },
          {
            "title": "枚举",
            "body": "//: param custom {\n//:   \"default\": -1,\n//:   \"label\": \"Combobox\",\n//:   \"widget\": \"combobox\",\n//:   \"values\": {\n//:   \"Value -1\": -1,\n//:   \"Value 0\": 0,\n//:   \"Value 10\": 10\n//:   },\n//:   \"group\":\"Enum\"\n//: }\nuniform int u_combobox;"
          },
          {
            "title": "自定义纹理",
            "body": "//: param custom { \"default\": \"\", \"default_color\": [1.0, 1.0, 1.0, 1.0], \"label\": \"Texture\",\"usage\": \"texture\",\"group\":\"Texture\" }\n//: param custom { \"default\": \"\", \"label\": \"Texture\",\"usage\": \"environment\",\"group\":\"Texture\" }\nuniform sampler2D u_sampler1;\nvec4 tex = texture(u_sampler1, inputs.tex_coord);"
          },
          {
            "title": "内置通道图",
            "body": "//: param auto channel_basecolor\n//: param auto channel_ambientocclusion\n//: param auto channel_anisotropyangle\n//: param auto channel_anisotropylevel\n//: param auto channel_blendingmask\n//: param auto channel_diffuse\n//: param auto channel_displacement\n//: param auto channel_emissive\n//: param auto channel_glossiness\n//: param auto channel_height\n//: param auto channel_ior\n//: param auto channel_metallic\n//: param auto channel_normal\n//: param auto channel_opacity\n//: param auto channel_reflection\n//: param auto channel_roughness\n//: param auto channel_scattering\n//: param auto channel_specular\n//: param auto channel_specularlevel\n//: param auto channel_transmissive\nuniform SamplerSparse channel_tex;\nvec4 tex = textureSparse(channel_basecolor,i.sparse_coord);"
          },
          {
            "title": "用户自定义通道图",
            "body": "//: param auto channel_user0\n//: param auto channel_user1\n//: param auto channel_user2\n//: param auto channel_user3\n//: param auto channel_user4\n//: param auto channel_user5\n//: param auto channel_user6\n//: param auto channel_user7\nuniform SamplerSparse channel_userTex;"
          },
          {
            "title": "模型纹理",
            "body": "//: param auto texture_ambientocclusion (AO)\n//: param auto texture_curvature (曲率)\n//: param auto texture_id (ID图)\n//: param auto texture_normal (切线空间下的法线纹理)\n//: param auto texture_normal_ws (世界空间下的法线纹理)\n//: param auto texture_position (世界空间下的位置纹理)\n//: param auto texture_thickness (厚度纹理)\nuniform sampler2D u_meshTexture;"
          }
        ]
      },
      {
        "title": "片段输出",
        "entries": [
          {
            "title": "最终输出(emissiveColorOutput + albedoOutput * diffuseShadingOutput + specularShadingOutput)",
            "body": "void alphaOutput(1);\ndiffuseShadingOutput(vec3(0,0,0));\nspecularShadingOutput(vec3(0,0,0));\nemissiveColorOutput(vec3(0,0,0));\nalbedoOutput(vec3(1,1,1));\nsssCoefficientsOutput(vec4(0,0,0,0));"
          }
        ]
      }
    ]
  },
  {
    "id": "websites",
    "label": "StudyWebsite(学习网址)",
    "groups": [
      {
        "title": "学习网站",
        "entries": [
          {
            "title": "日本Unity网站",
            "body": "https://learning.unity3d.jp/tag/shader/",
            "url": "https://learning.unity3d.jp/tag/shader/"
          }
        ]
      },
      {
        "title": "编程网站",
        "entries": [
          {
            "title": "HLSL着色器语言",
            "body": "https://learn.microsoft.com/zh-cn/windows/win32/direct3dhlsl/dx-graphics-hlsl",
            "url": "https://learn.microsoft.com/zh-cn/windows/win32/direct3dhlsl/dx-graphics-hlsl"
          }
        ]
      },
      {
        "title": "计算机图形",
        "entries": [
          {
            "title": "图形学相关书籍",
            "body": "https://www.realtimerendering.com/#intro",
            "url": "https://www.realtimerendering.com/#intro"
          },
          {
            "title": "GDC文章",
            "body": "https://gdcvault.com/play/1034419/",
            "url": "https://gdcvault.com/play/1034419/"
          },
          {
            "title": "OpenGL网址",
            "body": "https://learnopengl-cn.github.io/",
            "url": "https://learnopengl-cn.github.io/"
          },
          {
            "title": "ShaderToy",
            "body": "https://www.shadertoy.com/",
            "url": "https://www.shadertoy.com/"
          },
          {
            "title": "片元图形算法",
            "body": "https://glslsandbox.com/",
            "url": "https://glslsandbox.com/"
          },
          {
            "title": "图形公式算法",
            "body": "https://iquilezles.org/articles/",
            "url": "https://iquilezles.org/articles/"
          },
          {
            "title": "图形与编程",
            "body": "https://xbdev.net/maths_of_3d/index.php",
            "url": "https://xbdev.net/maths_of_3d/index.php"
          },
          {
            "title": "Catlike Coding",
            "body": "https://catlikecoding.com/",
            "url": "https://catlikecoding.com/"
          },
          {
            "title": "Physically Based Rendering",
            "body": "https://www.pbr-book.org/3ed-2018/contents",
            "url": "https://www.pbr-book.org/3ed-2018/contents"
          },
          {
            "title": "有向距离场",
            "body": "https://jamie-wong.com/2016/07/15/ray-marching-signed-distance-functions/#signed-distance-functions",
            "url": "https://jamie-wong.com/2016/07/15/ray-marching-signed-distance-functions/#signed-distance-functions"
          },
          {
            "title": "延迟渲染与前向渲染",
            "body": "https://www.3dgep.com/forward-plus/",
            "url": "https://www.3dgep.com/forward-plus/"
          },
          {
            "title": "光照与阴影",
            "body": "https://ciechanow.ski/lights-and-shadows/",
            "url": "https://ciechanow.ski/lights-and-shadows/"
          },
          {
            "title": "Shader演示案例",
            "body": "http://shaderslab.com/shaders.html",
            "url": "http://shaderslab.com/shaders.html"
          },
          {
            "title": "BookOfShader(Fragment算法)",
            "body": "https://thebookofshaders.com/10/",
            "url": "https://thebookofshaders.com/10/"
          },
          {
            "title": "3D图形编程",
            "body": "https://paroj.github.io/gltut/",
            "url": "https://paroj.github.io/gltut/"
          },
          {
            "title": "CG编程",
            "body": "https://en.wikibooks.org/wiki/Cg_Programming/Unity",
            "url": "https://en.wikibooks.org/wiki/Cg_Programming/Unity"
          }
        ]
      },
      {
        "title": "Graphing Calculator(图形工具)",
        "entries": [
          {
            "title": "公式文本编辑器",
            "body": "https://www.latexlive.com/home##",
            "url": "https://www.latexlive.com/home##"
          },
          {
            "title": "GeoGebra计算器",
            "body": "https://www.geogebra.org/",
            "url": "https://www.geogebra.org/"
          },
          {
            "title": "图形波形计算器",
            "body": "https://graphtoy.com/",
            "url": "https://graphtoy.com/"
          },
          {
            "title": "数学计算器",
            "body": "https://www.desmos.com/calculator?lang=zh-CN",
            "url": "https://www.desmos.com/calculator?lang=zh-CN"
          },
          {
            "title": "Symbolab计算器",
            "body": "https://www.symbolab.com/graphing-calculator/linear-graph",
            "url": "https://www.symbolab.com/graphing-calculator/linear-graph"
          },
          {
            "title": "BRDF3D可视化",
            "body": "https://patapom.com/topics/WebGL/BRDF/",
            "url": "https://patapom.com/topics/WebGL/BRDF/"
          },
          {
            "title": "二进制计算器",
            "body": "https://tool.oschina.net/hexconvert",
            "url": "https://tool.oschina.net/hexconvert"
          },
          {
            "title": "ShaderFrog",
            "body": "https://shaderfrog.com/app",
            "url": "https://shaderfrog.com/app"
          },
          {
            "title": "Pixel编辑器",
            "body": "http://pixelshaders.com/editor/",
            "url": "http://pixelshaders.com/editor/"
          }
        ]
      },
      {
        "title": "各向异性",
        "entries": [
          {
            "title": "HairRendering",
            "body": "https://web.engr.oregonstate.edu/~mjb/cs519/Projects/Papers/HairRendering.pdf",
            "url": "https://web.engr.oregonstate.edu/~mjb/cs519/Projects/Papers/HairRendering.pdf"
          }
        ]
      }
    ]
  },
  {
    "id": "graphical",
    "label": "MathGraphical(图形函数)",
    "groups": [
      {
        "title": "MathGraphical(图形函数)",
        "entries": [
          {
            "title": "MathFunction",
            "image": "assets/Image/Library/MathFunction.png"
          }
        ]
      }
    ]
  },
  {
    "id": "about",
    "label": "About",
    "groups": [
      {
        "title": "About",
        "entries": [
          {
            "title": "Git主页：",
            "body": "https://github.com/yunyufeiwei/CustomShaderReference",
            "url": "https://github.com/yunyufeiwei/CustomShaderReference"
          },
          {
            "title": "知乎主页：",
            "body": "https://www.zhihu.com/people/XiaoYu",
            "url": "https://www.zhihu.com/people/XiaoYu"
          },
          {
            "title": "B站主页：",
            "body": "https://space.bilibili.com/382898888",
            "url": "https://space.bilibili.com/382898888"
          }
        ]
      }
    ]
  }
];
