struct Attributes
{
    float4 positionOS   : POSITION;
    float2 texcoord     : TEXCOORD;
};
struct Varyings
{
    float4 positionHCS  : SV_POSITION;
    float2 uv           : TEXCOORD;
};

TEXTURE2D(_BaseMap);SAMPLER(sampler_BaseMap);

CBUFFER_START(UnityPerMaterial)
    float4 _BaseMap_ST;
    float4  _Color;
CBUFFER_END

Varyings vert(Attributes v)
{
    Varyings o = (Varyings)0;

    o.positionHCS = TransformObjectToHClip(v.positionOS.xyz);
    o.uv = TRANSFORM_TEX(v.texcoord , _BaseMap);

    return o;
}

half4 frag(Varyings i):SV_TARGET
{
    half4 FinalColor;
    half4 baseMap = SAMPLE_TEXTURE2D(_BaseMap,sampler_BaseMap , i.uv);
    FinalColor = baseMap * _Color;
    return FinalColor;
}
